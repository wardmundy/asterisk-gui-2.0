/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * Login functions and other misc functions for index.html
 *
 * Copyright (C) 2006-2008, Digium, Inc.
 *
 * Pari Nannapaneni <pari@digium.com>
 *
 * See http://www.asterisk.org for more information about
 * the Asterisk project. Please do not directly contact
 * any of the maintainers of this project for assistance;
 * the project provides a web site, mailing lists and IRC
 * channels for your use.
 *
 * This program is free software, distributed under the terms of
 * the GNU General Public License Version 2. See the LICENSE file
 * at the top of the source tree.
 *
 */

// Object to store all sequence of functions that should execute on login
var onLogInFunctions = {
	makePings: {
		noServer: function(){
			try{
				ASTGUI.Log.Debug("PING Request: REQUEST FAILED ");
				if( onLogInFunctions.makePings.isRetryPing ){
					alert("No Response !");
				}else{
					onLogInFunctions.makePings.stop();
					_$('noResponseFromServer').style.height = document.body.scrollHeight;
					$('#noResponseFromServer').show();
					$('#mainscreen').hide();
				}
			}catch(err){ alert("Unable to Connect to server!"); }finally{ ASTGUI.dialog.hide();}
		},
		makeRetryPing: function(){
			onLogInFunctions.makePings.isRetryPing = true;
			$.ajax({
				type: 'GET',
				url: ASTGUI.paths.rawman,
				data: 'action=ping',
				success: function(t){
					if(t.toLowerCase().contains('pong')){ // if session still alive resume making pings
						onLogInFunctions.makePings.start();
						$('#noResponseFromServer').hide();
						//ASTGUI.dialog.hide();
						$('#mainscreen').show();
					}else{
						ASTGUI.Log.Debug('PING Request: INVALID SESSION');
						if( sessionData.DEBUG_MODE ){
							alert('PING Request: INVALID SESSION' + '\n' + 'Click OK to reload');
						}
						top.window.location.replace(top.window.location.href);
						return true; 
					}
				},
				error: onLogInFunctions.makePings.noServer
			});
		},
		start: function(){
			this.isRetryPing = false;
			var makePingRequest = function(){
				var verifyPingResult = function(t) {
					if(!t.toLowerCase().contains('pong')){
						ASTGUI.Log.Debug('PING Request: INVALID SESSION');
						if( sessionData.DEBUG_MODE ){
							alert('PING Request: INVALID SESSION' + '\n' + 'Click OK to reload');
						}
						onLogInFunctions.makePings.stop();
						top.window.location.replace(top.window.location.href); return true; 
					}else{
						ASTGUI.Log.Debug('PING Request: Success');
					}
				};
				$.ajax({
					type: 'GET',
					url: ASTGUI.paths.rawman,
					data: 'action=ping',
					success: verifyPingResult,
					error: onLogInFunctions.makePings.noServer
				});
			};
			this.keepPinging = setInterval( makePingRequest, ASTGUI.globals.pingInterval);
		},
		stop: function(){
			clearInterval( this.keepPinging );
		}
	},

	detectPlatform: function(resp){
		sessionData.AsteriskVersionString = resp;

		// logic for platform detection, 
		if( sessionData.PLATFORM.isAA50 || sessionData.PLATFORM.isABE ){
			if( sessionData.PLATFORM.isAA50 ){
 				sessionData.PLATFORM.isOSA = false ;
				sessionData.PLATFORM.isAST_1_4 = false ;
				sessionData.PLATFORM.isAST_1_6 = false ;
				sessionData.listOfCodecs = {
					'ulaw' : 'u-law' ,
					'alaw' : 'a-law' ,
					'gsm'  : 'GSM' ,
					'g729' : 'G.729A',
					'g726' : 'G.726' ,
					'g722' : 'G.722'
				};
			}
			// ??
		}else{
			var resp_lower = resp.toLowerCase();
			if(  resp_lower.contains("branches/1.4")  || resp_lower.contains("asterisk/1.4") ||  resp_lower.contains("svn-branch-1.4") ) {
				sessionData.PLATFORM.isAST_1_4 = true ;
				sessionData.PLATFORM.isAST_1_6 = false ;
			}else if ( resp_lower.contains("branches/1.6")  || resp_lower.contains("asterisk/1.6") ||  resp_lower.contains("svn-branch-1.6") ||  resp_lower.contains("svn-trunk-")  ){
				sessionData.PLATFORM.isAST_1_4 = false ;
				sessionData.PLATFORM.isAST_1_6 = true ;
			}else {
				sessionData.PLATFORM.isAST_1_4 = true ;
				sessionData.PLATFORM.isAST_1_6 = false ;
			}
		}
	},

	check_ReadWritePermissions : function(){
		// We write a random context in http.conf and read it back to make sure we have manager read/write permissions 
		//if( ASTGUI.cookies.getCookie('rwaccess') == 'yes' ){
		//	return true;
		//}
		var rand = 'test_' + Math.round(100000*Math.random());
		var wa = 'writeaccess';
		var u = new listOfSynActions('http.conf') ;
		u.new_action('newcat', rand , '', '') ;
		u.new_action('append', rand , wa, 'yes') ;
		u.callActions();

		var http_conf = config2json({ filename:'http.conf', usf:1 });
		if( !http_conf.hasOwnProperty(rand) || !http_conf[rand].hasOwnProperty(wa) || http_conf[rand][wa] !='yes' ){
			ASTGUI.cookies.removeCookie('rwaccess');
			return false; // no read/write access to the GUI
		}

		if( sessionData.PLATFORM.isAA50 ){ // make sure all the required upload paths are there
			u.clearActions();
			var pu = false;
			if(!http_conf.hasOwnProperty('post_mappings') ){
				u.new_action('newcat', 'post_mappings' , '', '') ;
				http_conf.post_mappings = {};
				pu = true;
			}
			if( !http_conf.post_mappings.hasOwnProperty('uploads') ){
				u.new_action('append', 'post_mappings' , 'uploads', '/var/lib/asterisk/sounds/imageupdate' ) ;
				pu = true;
			}
			if( !http_conf.post_mappings.hasOwnProperty('backups') ){
				var tmp_cbkp = top.sessionData.directories.ConfigBkp ;
				if( tmp_cbkp.endsWith('/') ){ tmp_cbkp = tmp_cbkp.rChop('/'); }
				u.new_action('append', 'post_mappings' , 'backups', tmp_cbkp ) ;
				pu = true;
			}
			if( !http_conf.post_mappings.hasOwnProperty('moh') ){
				var tmp_cbkp = top.sessionData.directories.MOH ;
				if( tmp_cbkp.endsWith('/') ){ tmp_cbkp = tmp_cbkp.rChop('/'); }
				u.new_action('append', 'post_mappings' , 'moh', tmp_cbkp ) ;
				pu = true;
			}
			if( !http_conf.post_mappings.hasOwnProperty('voicemenuprompts') ){
				var tmp_cbkp = top.sessionData.directories.menusRecord ;
				if( tmp_cbkp.endsWith('/') ){ tmp_cbkp = tmp_cbkp.rChop('/'); }
				u.new_action('append', 'post_mappings' , 'voicemenuprompts', tmp_cbkp ) ;
				pu = true;
			}
			if ( pu == true ){
				u.new_action('delcat', rand , '', '') ;
				u.callActions();
				return 'postmappings_updated'; // about to reload
			}
		}

		if( sessionData.PLATFORM.isAST_1_6 ){ // make sure all the required upload paths are there
			u.clearActions();
			var pu = false;
			if(!http_conf.hasOwnProperty('post_mappings') ){
				u.new_action('newcat', 'post_mappings' , '', '') ;
				http_conf.post_mappings = {};
				pu = true;
			}
			if( !http_conf.post_mappings.hasOwnProperty('backups') ){
				var tmp_cbkp = top.sessionData.directories.ConfigBkp ;
				if( tmp_cbkp.endsWith('/') ){ tmp_cbkp = tmp_cbkp.rChop('/'); }
				u.new_action('append', 'post_mappings' , 'backups', tmp_cbkp ) ;
				pu = true;
			}
			if( !http_conf.post_mappings.hasOwnProperty('moh') ){
				var tmp_cbkp = top.sessionData.directories.MOH ;
				if( tmp_cbkp.endsWith('/') ){ tmp_cbkp = tmp_cbkp.rChop('/'); }
				u.new_action('append', 'post_mappings' , 'moh', tmp_cbkp ) ;
				pu = true;
			}
			if ( pu == true ){
				u.new_action('delcat', rand , '', '') ;
				u.callActions();
				return 'postmappings_updated'; // about to reload
			}
		}
		u.clearActions();
		u.new_action('delcat', rand , '', '') ;
		u.callActions();
		ASTGUI.cookies.setCookie( 'rwaccess' , 'yes' );
		return true;
	},

	check_WritePermissionsFor_GUI_Folder : function(){
		if(sessionData.PLATFORM.isAA50 ){
			onLogInFunctions.checkForCompactFlash();
			return;
		}

		ASTGUI.dialog.waitWhile('Checking write permission for gui folder');
		var rand_1 = Math.round(100000*Math.random());
		ASTGUI.systemCmdWithOutput( 'echo ' + rand_1  , function(s){
			if( !s.contains(rand_1) ){
				ASTGUI.dialog.alertmsg( 'Asterisk needs write privileges on ' + top.sessionData.directories.guiInstall );
			}

			ASTGUI.dialog.waitWhile('detecting Hardware ..');
			onLogInFunctions.runZtscan();
		});
	},

	setGUI_Paths: function(){
		// onLogInFunctions.setGUI_Paths()
		var ASTERISK_CONF = context2json({ filename:'asterisk.conf' , context : 'directories' , usf:1 }) ;

		sessionData.directories.asteriskConfig = ( ASTERISK_CONF.hasOwnProperty('astetcdir') ) ? ASTERISK_CONF.astetcdir : '/etc/asterisk/' ;
		sessionData.directories.astvarlibdir = ( ASTERISK_CONF.hasOwnProperty('astvarlibdir') ) ? ASTERISK_CONF.astvarlibdir : '/var/lib/asterisk/' ;
		sessionData.directories.AGIBIN = ( ASTERISK_CONF.hasOwnProperty('astagidir') ) ? ASTERISK_CONF.astagidir : '/var/lib/asterisk/agi-bin/' ;
		sessionData.directories.astspooldir = ( ASTERISK_CONF.hasOwnProperty('astspooldir') ) ? ASTERISK_CONF.astspooldir : '/var/spool/asterisk/' ;

		if( !sessionData.directories.asteriskConfig.endsWith('/') ){ sessionData.directories.asteriskConfig = sessionData.directories.asteriskConfig + '/' ; }
		if( !sessionData.directories.astvarlibdir.endsWith('/') ){ sessionData.directories.astvarlibdir = sessionData.directories.astvarlibdir + '/' ; }
		if( !sessionData.directories.AGIBIN.endsWith('/') ){ sessionData.directories.AGIBIN = sessionData.directories.AGIBIN + '/' ; }
		if( !sessionData.directories.astspooldir.endsWith('/') ){ sessionData.directories.astspooldir = sessionData.directories.astspooldir + '/' ; }

		sessionData.directories.guiInstall = sessionData.directories.astvarlibdir + 'static-http/config/' ;
		sessionData.directories.ConfigBkp = sessionData.directories.astvarlibdir + 'gui_backups/';
		sessionData.directories.ConfigBkp_dldPath = sessionData.directories.guiInstall + 'private/bkps/'; // path for keeping the bkp files for download
		sessionData.directories.Sounds = sessionData.directories.astvarlibdir + 'sounds/' ;
		sessionData.directories.MOH = sessionData.directories.astvarlibdir + 'moh/' ; // path for music on hold files
		sessionData.directories.menusRecord = sessionData.directories.Sounds + 'record/' ;

		sessionData.directories.scripts = sessionData.directories.astvarlibdir + 'scripts/';/* Directory for gui scripts (listfiles, for example) */	
		sessionData.directories.output_SysInfo = './sysinfo_output.html' ;
		sessionData.directories.voicemails_dir = sessionData.directories.astspooldir + 'voicemail/default/' ;
		sessionData.directories.script_takeBackup =  'sh ' + sessionData.directories.scripts + 'takebackup';
		sessionData.directories.script_restoreBackup =  'sh ' + sessionData.directories.scripts + 'restorebackup';
		sessionData.directories.script_ListFiles = 'sh ' + sessionData.directories.scripts + 'listfiles';
		sessionData.directories.script_NetworkSettings = 'sh ' + sessionData.directories.scripts + 'networking.sh';
		sessionData.directories.script_generateZaptel = 'sh ' + sessionData.directories.scripts + 'editzap.sh';
		sessionData.directories.script_generatemISDN_init = 'sh ' + sessionData.directories.scripts + 'editmisdn.sh';
		sessionData.directories.script_dldsoundpack = 'sh ' + sessionData.directories.scripts + 'dldsoundpack';
		sessionData.directories.script_mastercsvexists = 'sh ' + sessionData.directories.scripts + 'mastercsvexists';
		sessionData.directories.script_Registerg729 = 'sh ' + sessionData.directories.scripts + 'registerg729.sh';

		sessionData.directories.app_Ztscan = 'ztscan > ' + sessionData.directories.asteriskConfig +'ztscan.conf' ;
		sessionData.directories.app_mISDNscan = 'misdn-init scan' ;
		sessionData.directories.app_flashupdate = 'flashupdate' ;
	},

	checkifLoggedIn: function(){
		var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=ping', async: false });
		var resp = s.getResponseHeader("Server");
		onLogInFunctions.setGUI_Paths();
		onLogInFunctions.detectPlatform(resp); // <-- PLATFORM Detection

		if(s.responseText.toLowerCase().match('pong')){
			ASTGUI.Log.Debug('Got PONG , session is active');

			$('div.ui-accordion-link:eq(0)')[0].innerHTML = 'System Status';
			$('div.ui-accordion-desc:eq(0)')[0].innerHTML = 'Please click on a panel to manage related features';
			sessionData.isLoggedIn = true;
			var crwp = onLogInFunctions.check_ReadWritePermissions() ;
			if( !crwp ){ // Check if the GUI has read/write access
				ASTGUI.dialog.hide();
				ASTGUI.dialog.alertmsg('The GUI does not have necessary privileges. <BR> Please check the manager permissions for the user !');
				return;
			}
			if( crwp == 'postmappings_updated' ){
				parent.ASTGUI.dialog.waitWhile(' reloading asterisk ... ');
				var t = ASTGUI.cliCommand('reload') ;
				setTimeout( function(){ 
					if( sessionData.DEBUG_MODE ){
						alert('postmappings updated in http.conf' + '\n' + 'Click OK to reload');
					}
					top.window.location.reload(); 
				} , 1000 );
				return ; // about to reload
			}
			DOM_mainscreen.src = 'home.html';
			setTimeout ( miscFunctions.resizeMainIframe, 1000 );

			onLogInFunctions.makePings.start();

			ASTGUI.dialog.waitWhile('Parsing Config Files ..');
			onLogInFunctions.parseConfigFiles();
		}else{
			ASTGUI.Log.Error('NO active session : show login page');
			ASTGUI.Log.Debug('s.responseText is "' + s.responseText + '"' );
			$('div.ui-accordion-desc:eq(0)')[0].innerHTML = 'Please login ';
			sessionData.isLoggedIn = false;
			ASTGUI.dialog.hide();
			DOM_mainscreen.src = 'home.html';
			setTimeout ( miscFunctions.resizeMainIframe, 1000 );
		}
	},

	parseConfigFiles: function(){
		sessionData.pbxinfo = {}; //reset any previous stored information
		sessionData.continueParsing = true;
		try{
			try{
				readcfg.checkEssentials();
				// check extensions.conf (macro trunkdial, guitools , other required contexts etc), check [general] in users.conf etc
				if( sessionData.continueParsing == false )return;
			}catch(er){
				ASTGUI.Log.Error('Error in readcfg.checkEssentials()' + '<BR>error msg: ' + er.description );
			}

			try{
				readcfg.ExtensionsConf();
				if( sessionData.continueParsing == false )return;
			}catch(er){
				ASTGUI.Log.Error('Error in readcfg.ExtensionsConf()');
			}

			try{
				readcfg.guiPreferencesConf();
				if( sessionData.continueParsing == false )return;
			}catch(er){
				ASTGUI.Log.Error('Error in readcfg.guiPreferencesConf()');
			}

			try{
				readcfg.httpConf();
			}catch(er){
				ASTGUI.Log.Error('Error in readcfg.httpConf()');
			}

			try{
				astgui_manageConferences.loadMeetMeRooms();
			}catch(er){
				ASTGUI.Log.Error('Error in astgui_manageConferences.loadMeetMeRooms()');
			}

			try{
				astgui_manageQueues.loadQueues();
			}catch(er){
				ASTGUI.Log.Error('Error in astgui_manageQueues.loadQueues()');
			}

			try{
				readcfg.UsersConf();
			}catch(er){
				ASTGUI.Log.Error('Error in readcfg.UsersConf()');
			}

			try{
				readcfg.MisdnConf();
			}catch(er){
				ASTGUI.Log.Error('Error in readcfg.MisdnConf()');
			}

		}catch(err){
			ASTGUI.Log.Error('Error in onLogInFunctions.parseConfigFiles()');
		}finally{
			if( sessionData.continueParsing == false ){
				return;
			}
			sessionData.finishedParsing = true;
			onLogInFunctions.check_WritePermissionsFor_GUI_Folder();
		}
	},

	checkForCompactFlash: function(){ // onLogInFunctions.checkForCompactFlash()
		//check for compact flash
		ASTGUI.dialog.waitWhile('Checking for CompactFlash ..');
		var lookfor_CF = function(output){
			sessionData.hasCompactFlash = ( output.contains('/dev/hda1') ) ? true : false ;
			onLogInFunctions.getAA50SKU();
		};
		ASTGUI.systemCmdWithOutput( 'df -k' , lookfor_CF );
	},

	getAA50SKU : function(){
		ASTGUI.dialog.waitWhile('Getting product information ..');
		var after = function(output){
			var lines = output.split('\n');
			lines.each( function(line){
				if( line.contains('Product SKU:') ){
					sessionData.PLATFORM.AA50_SKU = line.lChop('Product SKU:').trim();
				}
			});
			if( sessionData.PLATFORM.AA50_SKU.contains('800') ){ // skip ztscan for AA50-s800 sku
				miscFunctions.hide_panel('digital.html');
				onLogInFunctions.updatePanels4Platform();
			}else{
				onLogInFunctions.runZtscan();
			}
		};
		ASTGUI.systemCmdWithOutput( 's800iconfig' , after);
	},

	runZtscan : function(){ // onLogInFunctions.runZtscan()
		ASTGUI.dialog.waitWhile('detecting Hardware ..');
		var cb = function(){
			onLogInFunctions.updatePanels4Platform();
		};
		ASTGUI.systemCmd(top.sessionData.directories.app_Ztscan, cb);
	},


	updatePanels4Platform: function(){
		var tmp_continue = astgui_updateConfigFromOldGui(); // update configuration form 1.x gui if needed
		if( !tmp_continue )return;

		$(".AdvancedMode").hide();

		setTimeout( function(){
			var modules_show = ASTGUI.cliCommand('module show');
			if( modules_show.contains('res_jabber.so') && modules_show.contains('chan_gtalk.so') ){
				miscFunctions.hide_panel('gtalk.html', 1);
			}
			if( modules_show.contains('codec_g729a') ){
				miscFunctions.hide_panel('registerg729.html', 1);
			}
			if( modules_show.contains('res_skypeforasterisk') && modules_show.contains('chan_skype') ){
				miscFunctions.hide_panel('skype.html', 1);
			}

		}, 2000);

		if(sessionData.PLATFORM.isAA50 ){
			$(".notinAA50").remove(); 
			$(".forAA50").show();
			$(".copyrights")[0].innerHTML += "<div class='lite'>CompactFlash&reg; is a registered trademark of SanDisk Corporation</div>" 
		}else{
			$(".notinAA50").show(); 
			$(".forAA50").remove();
		}
		$('div.ui-accordion-link').show(); // finally show all panels
		$('#ptopbuttons').show();
		if( ASTGUI.cookies.getCookie('configFilesChanged') == 'yes' ){
			$('#applyChanges_Button').show();
		}else{
			$('#applyChanges_Button').hide();
		}
		ASTGUI.dialog.hide();

		/* CUSTOM ACTIONS BASED ON GET PARAMS */
		// GUI will be reloaded after each Custom Command
		var this_mainURL = window.location.href ;

		var tmp_enableOverLay = ASTGUI.parseGETparam( this_mainURL , 'overlay');
		if( tmp_enableOverLay.isAstTrue() ){
			var tmp_overlay_dir = '';
			if( sessionData.PLATFORM.isAA50 ){
				tmp_overlay_dir = 'mkdir -p /var/lib/asterisk/sounds/asteriskoverlay' ;
			}
			if( sessionData.PLATFORM.isABE ){
				tmp_overlay_dir = 'mkdir -p /var/lib/asterisk/gui-overlay' ;
			}
			ASTGUI.systemCmd( tmp_overlay_dir , function(){
				top.window.location.href = this_mainURL.withOut( 'overlay=' );
			});
			return;
		}


		if( sessionData.PLATFORM.isABE ){ // ABE-1600
// 			ASTGUI.systemCmdWithOutput( "ls /var/lib/asterisk/" , function(a){
// 				if( a.contains('gui-overlay') ){
// 					$('.default_Hidden').show();
// 				}
// 			});
		}


		//if( sessionData.PLATFORM.isAA50  ){
			DOM_mainscreen.src = 'home.html?status=1';
		//}

		if( sessionData.PLATFORM.isAA50 && sessionData.PLATFORM.AA50_SKU.contains('800') ){
			// no need to parse ztscan output for s800 SKU
		}else{
			readcfg.ztScanConf();
		}

		miscFunctions.show_advancedMode();
	}
};


var miscFunctions = {
	toDigiumStore: function(a){ // parent.miscFunctions.toDigiumStore('G729CODEC')
		if(!a) return;
		var win=window.open('','myWin');
		win.location.href = 'http://store.digium.com/productview.php?product_code='+ a ;
	},

	listOfChannels: function() { // miscFunctions.listOfChannels() -- returns an array of current active channels
		var raw_chan_status = makeSyncRequest ( { action :'status' } );
		var to_return = [];
		try {
			var chunks = ASTGUI.miscFunctions.getChunksFromManagerOutput( raw_chan_status.trim().replace(/Event: StatusComplete/, ""), true) ;
			while( chunks.length ){
				if( chunks[0].hasOwnProperty('Channel') ){
					to_return.push(chunks[0]);
				}
				chunks.removeFirst();
			}

		} catch(e) {
			ASTGUI.Log.Debug("Error listOfChannels: " + e);
			return to_return;
		}
		return to_return;
	},

	getTimeIntervals: function(){ // miscFunctions.getTimeIntervals();
		var TI_LIST = new ASTGUI.customObject;
		var tmp_globals = context2json({ filename: 'extensions.conf' , context : 'globals' , usf:0 });
		for( var t = 0 ; t < tmp_globals.length ; t++ ){
			if( tmp_globals[t].beginsWith( ASTGUI.contexts.TimeIntervalPrefix ) ){
				TI_LIST[ tmp_globals[t].lChop(ASTGUI.contexts.TimeIntervalPrefix).beforeChar('=') ] = tmp_globals[t].afterChar('=') ;
			}
		}
		return TI_LIST;
	},

	hide_panel: function(fname , show){ // parent.miscFunctions.hide_panel('page.html' , 0/1 )
		var t = $('.ui-accordion-link') ;
		for(var p=0; p < t.length ; p++){
			if( $(t[p].parentNode).attr("page") == fname ){
				if(show){
					$(t[p].parentNode).show();
				}else{
					$(t[p].parentNode).hide();
				}
				return;
			}
		}
	},

	click_panel: function( fname , actualurl){ // parent.miscFunctions.click_panel('meetme.html')
		//ui-accordion-link
		var t = $('.ui-accordion-link') ;
		for(var p=0; p < t.length ; p++){
			var page = $(t[p].parentNode).attr("page");
			if(page == fname ){
				$('div.ui-accordion-desc').hide();
				if( actualurl ){
					DOM_mainscreen.src = actualurl ;
				}else{
					DOM_mainscreen.src = fname ;
				}
				$(t[p].parentNode).find("div").show();
				if( page == 'digital.html' && sessionData.PLATFORM.isAA50 ){
					$(t[p].parentNode).find("div")[1].innerHTML = 'Analog ports configuration';
				}
				return;
			}
		}
	},

	show_advancedMode : function(){
		var am = ASTGUI.cookies.getCookie('advancedmode');
		if( am && am == 'yes' ){
			$(".AdvancedMode").show();
		}else{
			$(".AdvancedMode").hide();
		}
		miscFunctions.resizeMainIframe();
	},

	flip_advancedmode: function(){
		var am = ASTGUI.cookies.getCookie('advancedmode');
		if( am && am == 'yes' ){
			ASTGUI.cookies.removeCookie('advancedmode');
			$(".AdvancedMode").hide();
		}else{
			ASTGUI.cookies.setCookie( 'advancedmode' , 'yes' );
			$(".AdvancedMode").show();
		}
		miscFunctions.resizeMainIframe();
	},

	applyChanges : function(cb){
		var u = _$('applyChanges_Button');
		if (sessionData.PLATFORM.isAST_1_4) {
			var t = ASTGUI.cliCommand('reload') ;
		} else {
			var t = ASTGUI.cliCommand('module reload');
		}
		u.style.display = 'none';
		ASTGUI.cookies.removeCookie('configFilesChanged');
		ASTGUI.feedback({msg:'Asterisk Reloaded !!', showfor: 3 , color: '#5D7CBA', bgcolor: '#FFFFFF'}) ;

		if(sessionData.PLATFORM.isAA50 ){
			//TODO - Save Changes
			parent.ASTGUI.systemCmd( 'save_config', function(){ if(cb){cb();} } );
		}else{
			if(cb)cb();
		}
		if( ASTGUI.cookies.getCookie('require_restart') == 'yes'){
			ASTGUI.dialog.alertmsg('The changes you made requires a restart. <BR> Your hardware might not work properly until you reboot !!');
			ASTGUI.cookies.removeCookie('require_restart');
		}
	},

	logoutFunction : {
		// Object to store all sequence of functions that should execute on logout
		// example if appliance - need to save changes before logout 
		confirmlogout : function(){
			if( sessionData.PLATFORM.isAA50 && ASTGUI.cookies.getCookie('configFilesChanged') == 'yes' ){

				parent.ASTGUI.yesOrNo({
					msg: 'You have unsaved changes !! <BR>Do you want to apply these changes before logging out ?' ,
					ifyes: function(){
						miscFunctions.applyChanges( miscFunctions.logoutFunction.doLogout );
					},
					ifno:function(){
						miscFunctions.logoutFunction.doLogout();
					},
					title : 'Apply changes before logout ?',
					btnYes_text :'Yes',
					btnNo_text : 'No'
				});

			}else{
				if(!confirm("Are you sure you want to logout ?")) { return true; }
				this.doLogout();
			}
		},
	
		doLogout: function(){
			var f = makeSyncRequest({ action :'logoff'});
			top.window.location.reload();
		}
	},

	resizeMainIframe : function(){
		var adw = DOM_accordion_div.offsetWidth + 3;
		var adh = DOM_accordion_div.offsetHeight;
		var min_height = 500;
		var ww = $(window).width();
		_$('ajaxstatus').style.left = ww - 75;
		DOM_mainscreen.style.width = ( ww > 950 ) ? ww - adw : 950 - adw;
		DOM_mainscreen.style.height = (adh > min_height ) ? adh: min_height ;
		if(adh < min_height){
			DOM_accordion_div.style.height = min_height;
		}
	},

	DEBUG_START : function(){
		if ( sessionData.DEBUG_PROFILER_BEGIN ) return ; // we want to call DEBUG_START only once during a gui session

		var m = _$('debug_messages');
		var aaaaa = function(){
			if(sessionData.DEBUG_MODE && sessionData.DEBUG_LOG.length){
				if( m.style.display == '' ){
					m.innerHTML = '<li>' + sessionData.DEBUG_LOG.join('<li>') ;
				}
			}
		};
		m.innerHTML = 'No log messages' ;
		var now = new Date();
		sessionData.DEBUG_PROFILER_BEGIN = now.getTime() ;
		setInterval( aaaaa , 3000);

		m.style.display = '';
		$('#dbw_flip').click(function(){
			if( m.style.display == '' ){
				m.style.display = 'none';
				this.innerHTML = 'Show debug messages'
				this.className = 'dbw_flip_hide';
				return;
			}
			if( m.style.display == 'none' ){
				m.innerHTML = (sessionData.DEBUG_LOG.length) ? '<li>' + sessionData.DEBUG_LOG.join('<li>') : 'No log messages' ;
				m.style.display = '';
				this.innerHTML = 'Hide debug messages'
				this.className = 'dbw_flip_show';
				return;
			}
		});

		aaaaa();

		_$('debugWindow_which_Ajax').checked = sessionData.DEBUG_WHICH.Ajax ;
		$('#debugWindow_which_Ajax').click(function(){ sessionData.DEBUG_WHICH.Ajax =  this.checked ; });

		_$('debugWindow_which_Debug').checked = sessionData.DEBUG_WHICH.Debug ;
		$('#debugWindow_which_Debug').click(function(){ sessionData.DEBUG_WHICH.Debug = this.checked ; });

		_$('debugWindow_which_Error').checked = sessionData.DEBUG_WHICH.Error ;
		$('#debugWindow_which_Error').click(function(){ sessionData.DEBUG_WHICH.Error = this.checked ; });

		_$('debugWindow_which_Console').checked = sessionData.DEBUG_WHICH.Console ;
		$('#debugWindow_which_Console').click(function(){ sessionData.DEBUG_WHICH.Console = this.checked ; });

		_$('debugWindow_which_Info').checked = sessionData.DEBUG_WHICH.Info ;
		$('#debugWindow_which_Info').click(function(){ sessionData.DEBUG_WHICH.Info = this.checked ; });

		_$('debugWindow_which_Warnings').checked = sessionData.DEBUG_WHICH.Warn ;
		$('#debugWindow_which_Warnings').click(function(){ sessionData.DEBUG_WHICH.Warn = this.checked ; });

	},
	
	DEBUG_CLEAR : function(){
		sessionData.DEBUG_LOG = [];
		_$('debug_messages').innerHTML = 'No log messages ' ;
	},

	setFeedback : function(fb){
		// donot call this function directly 
		// instead do -- ASTGUI.feedback( { msg:'your message here', showfor:2, color:'#000000', bgcolor:'#FFFFFF' } );
		fb.showfor = 5; // over write all showfor values (kenny said messages are disappearing before anyone could read them)
		var k = $("#feedback") ;
		if( sessionData.fbtimer ){ clearTimeout( sessionData.fbtimer ); }
		if (!fb){ k.hide(); return true; }
			if( !fb.showfor){ fb.showfor = 3; }
			if( !fb.color ){ fb.color = '#6573c2'; }
			if( !fb.bgcolor ){ fb.bgcolor = '#FFFFFF'; }
			switch(fb.color){
				case 'green':
					fb.color = '#32633d';
					break;
				case 'red':
					fb.color = '#a02920';
					break;
				case 'brown':
					fb.color = '#6e2920';
				case 'orange':
					fb.color = '#ff8e03';
					break;
				case 'gray':
					fb.color = '#53646d';
					break;
				default:
					break;
			}
		k.css({ backgroundColor: fb.bgcolor, fontWeight: "", color: fb.color });
		k[0].innerHTML = fb.msg ;
		k.show();
		setTimeout( function(){ top.window.scroll(0,0); } , 50 );
		var clearFb = function(){ 
			sessionData.fbtimer = 0;
			k[0].innerHTML='';
			k.hide();
		};
		sessionData.fbtimer = setTimeout( clearFb , fb.showfor*1000 );
	},
			
	AFTER_REBOOT_CMD: function(){ // miscFunctions.AFTER_REBOOT_CMD()
		ASTGUI.showbg(true);
		onLogInFunctions.makePings.stop();
		var count_down = function(n){
			if(n){
				if( n > 60 ){
					setTimeout( function(){ n = n-5; count_down(n); } , 5000 );
					var m = ' ' + String(parseInt(n/60,10)) + ':' + String(n%60) + ' Seconds';
				}else{
					setTimeout( function(){ n = n-1; count_down(n); } , 1000 );
					var m = n + ' Seconds';
				}

				var tmp_msg = ' GUI will be reloaded in <B><font size="+1">' + m + '</B></font>' 
					+ '<BR><BR> <font size="-1">Note: The IP address where you access the gui might be changed on reboot depending on your configuration.</font>' ;

				parent.ASTGUI.dialog.waitWhile(tmp_msg) ;
			}else{
				if( sessionData.DEBUG_MODE ){
					alert('CountDown complete' + '\n' + 'Click OK to reload');
				}
				top.window.location.reload() ;
			}
		};

		var fr = ASTGUI.cookies.getCookie('firmware_reboot')
		ASTGUI.cookies.removeCookie('firmware_reboot');
		if( fr == 'yes') {
			count_down(480);
		}else{
			count_down(60);
		}
	},

	reboot_pbx: function( opt ){ // miscFunctions.reboot_pbx
		parent.ASTGUI.yesOrNo({
			msg: (opt && opt.msg) || 'Note: Rebooting appliance will terminate any active calls.' ,
			ifyes: function(){
				if( sessionData.PLATFORM.isAA50 && ASTGUI.cookies.getCookie('configFilesChanged') == 'yes' ){
					parent.ASTGUI.dialog.waitWhile('Rebooting !');
					setTimeout( function(){
							parent.ASTGUI.dialog.hide();
							parent.ASTGUI.yesOrNo({
								msg: 'You have unsaved changes !! <BR>Do you want to save these changes before rebooting ?' ,
								ifyes: function(){
									parent.ASTGUI.systemCmd ('save_config', function(){
										parent.ASTGUI.systemCmd ('reboot', miscFunctions.AFTER_REBOOT_CMD );
									});
								},
								ifno:function(){
									parent.ASTGUI.systemCmd ('reboot', miscFunctions.AFTER_REBOOT_CMD );
								},
								title : 'Save changes before reboot ?',
								btnYes_text :'Yes',
								btnNo_text : 'No'
							});
						}, 2000 );
				}else{
					parent.ASTGUI.systemCmd ('reboot', miscFunctions.AFTER_REBOOT_CMD );
				}
			},
			ifno:function(){
				
			},
			title : 'Reboot now ?',
			btnYes_text :'Reboot Now',
			btnNo_text : (opt && opt.btnNo_text) || 'Cancel'
		});
	},

	getAllDestinations: function(){ // miscFunctions.getAllDestinations() // --> returns an Array of Objects
	// There are various places in the gui where we want to preset a select box with all possible destinations
	// for Example - in incoming calls, Voicemenus, RingGroups etc.
	// this function navigates through all properties of sessionData.pbxinfo and returns an Array of Objects with all the possible destinations
		var tmp = [] ;
		var y = astgui_manageusers.listOfUsers();
			y.each(function(user){
				tmp.push({ optionText: 'User Extension -- ' + user , optionValue: 'Goto(default,' + user + ',1)' });

				if( sessionData.pbxinfo.users[user].getProperty('hasvoicemail').isAstTrue() ){
					tmp.push({ optionText: 'User VoiceMailBox ' + user , optionValue: 'Voicemail(' + user + ',u)' });
				}

			});
		var y = sessionData.pbxinfo.conferences.getOwnProperties();
			y.each(function(meetme){
				tmp.push({ optionText: 'Conference Room -- ' + meetme , optionValue: 'Goto('+ ASTGUI.contexts.CONFERENCES +','+ meetme + ',1)' });
				
				var tmp_adminOptions = sessionData.pbxinfo.conferences[meetme].getProperty('adminOptions') ;
				if( tmp_adminOptions ){
					var meetme_admin = ASTGUI.parseContextLine.getExten( tmp_adminOptions );
					tmp.push({ optionText: 'Conference Room Admin -- ' + meetme_admin , optionValue: 'Goto('+ ASTGUI.contexts.CONFERENCES +','+ meetme_admin + ',1)' });
				}

			});
		var y = sessionData.pbxinfo.queues.getOwnProperties();
			y.each(function(q){
				if( sessionData.pbxinfo.queues[q]['configLine'].contains(',1,agentlogin()') ){
					var tmp_exten = ASTGUI.parseContextLine.getExten(sessionData.pbxinfo.queues[q]['configLine']) ;
					tmp.push({ optionText: 'Agent Login -- ' + tmp_exten , optionValue: 'Goto('+ ASTGUI.contexts.QUEUES +','+ tmp_exten + ',1)' });
					return;
				}
				if( sessionData.pbxinfo.queues[q]['configLine'].contains(',1,agentcallbacklogin()') ){
					var tmp_exten = ASTGUI.parseContextLine.getExten(sessionData.pbxinfo.queues[q]['configLine']) ;
					tmp.push({ optionText: 'Agent Callback Login -- ' + tmp_exten , optionValue: 'Goto('+ ASTGUI.contexts.QUEUES +','+ tmp_exten + ',1)' });
					return;
				}
				tmp.push({ optionText: 'Queue -- ' + q, optionValue: 'Goto('+ ASTGUI.contexts.QUEUES +','+ q + ',1)' });
			});
		var y = sessionData.pbxinfo.voicemenus.getOwnProperties();
			y.each(function(vmenu){
				var vm_name = sessionData.pbxinfo.voicemenus[vmenu].comment || vmenu ;
				tmp.push({ optionText: 'VoiceMenu -- ' + vm_name , optionValue: 'Goto('+ vmenu +',s,1)' });
			});
// 		var y = sessionData.pbxinfo.timebasedRules.getOwnProperties();
// 			y.each(function(tbr){
// 				var tbr_label = sessionData.pbxinfo.timebasedRules[tbr].label || tbr ;
// 				tmp.push({ optionText: 'Time Based Rule -- ' + tbr_label , optionValue: 'Goto('+ tbr +',s,1)' });
// 			});
		var y = sessionData.pbxinfo.ringgroups.getOwnProperties();
			y.each(function(rg){
				var rg_name = sessionData.pbxinfo.ringgroups[rg].NAME || rg ;
				tmp.push({ optionText: 'Ring Group -- ' + rg_name , optionValue: 'Goto('+ rg +',s,1)' });
			});
		var y = astgui_managePageGroups.getPGsList();
			y.each(function(pge){
				tmp.push({ optionText: 'Page Group -- ' + pge , optionValue: 'Goto('+ ASTGUI.contexts.PageGroups +','+ pge +',1)' });
			});
		var y = sessionData.pbxinfo.vmgroups.getOwnProperties();
			y.each(function( this_vmg_exten ){
				tmp.push({
						optionText: 'VoiceMail Group -- ' + (sessionData.pbxinfo.vmgroups[this_vmg_exten].getProperty('label') || this_vmg_exten ),
						optionValue: 'Goto('+ ASTGUI.contexts.VoiceMailGroups +',' + this_vmg_exten + ',1)'
					});
			});
		if( sessionData.pbxinfo['localextensions'].getProperty('defaultDirectory') ){
			var nde = sessionData.pbxinfo['localextensions'].getProperty('defaultDirectory') ;
			tmp.push({ optionText: 'Names Directory -- ' + nde , optionValue: 'Goto('+ ASTGUI.contexts.Directory + ',' + nde + ',1)' });
		}
		if( sessionData.pbxinfo['localextensions'].hasOwnProperty('VoiceMailMain') ){
			 var tmp_VMM_Exten = ASTGUI.parseContextLine.getExten( sessionData.pbxinfo['localextensions']['VoiceMailMain'] ) ;
			tmp.push({ optionText: 'Check Voicemails -- ' + tmp_VMM_Exten , optionValue: 'Goto(default,' + tmp_VMM_Exten + ',1)' });
		}
		tmp.push({ optionText: 'Operator' , optionValue: 'Goto(default,o,1)' });
		tmp.push({ optionText: 'Hangup' , optionValue: 'Hangup' });
		tmp.push({ optionText: 'Congestion' , optionValue: 'Congestion' });
		return tmp;
	},

	getAllExtensions : function(){ // miscFunctions.getAllExtensions() - returns Array of all Extensions
		var tmp = [] ;
		try{
			tmp = tmp.concat( astgui_manageusers.listOfUsers() );
			if( sessionData.pbxinfo['localextensions'].hasOwnProperty('VoiceMailMain') ){
				tmp.push( ASTGUI.parseContextLine.getExten( sessionData.pbxinfo['localextensions']['VoiceMailMain'] ) ) ;
			}
			var y = sessionData.pbxinfo.voicemenus.getOwnProperties();
				y.each( function( item ){
					var tmp_thisVMenu = ASTGUI.cloneObject(sessionData.pbxinfo.voicemenus[item]);
					if( tmp_thisVMenu.getProperty('alias_exten') ){
						tmp.push( ASTGUI.parseContextLine.getExten(tmp_thisVMenu.alias_exten) );
					}
				} );
			var y = sessionData.pbxinfo.conferences.getOwnProperties();
				y.each( function( item ){
					var tmp_thisMeetMe = ASTGUI.cloneObject(sessionData.pbxinfo.conferences[item]);
					if( tmp_thisMeetMe.getProperty('configOptions') ){
						tmp.push( ASTGUI.parseContextLine.getExten(tmp_thisMeetMe.configOptions) );
					}
					if( tmp_thisMeetMe.getProperty('adminOptions') ){
						tmp.push( ASTGUI.parseContextLine.getExten(tmp_thisMeetMe.adminOptions) );
					}
				} );
			var y = sessionData.pbxinfo.ringgroups.getOwnProperties();
				y.each( function( item ){
					var tmp_thisRg = ASTGUI.cloneObject(sessionData.pbxinfo.ringgroups[item]);
					if( tmp_thisRg.getProperty('extension') ){
						tmp.push( tmp_thisRg.extension );
					}
				} );
			tmp = tmp.concat( astgui_managePageGroups.getPGsList() );
			var tmp_LE = ASTGUI.cloneObject(sessionData.pbxinfo['localextensions']);
			if( tmp_LE.getProperty('defaultDirectory') ){
				tmp.push( tmp_LE.getProperty('defaultDirectory') );
			}
			tmp = tmp.concat( sessionData.pbxinfo.vmgroups.getOwnProperties() );
			tmp = tmp.concat( sessionData.pbxinfo.queues.getOwnProperties() );
		}catch(err){

		}finally{
			return tmp;
		}
	},

	ifExtensionAlreadyExists: function(a){ // miscFunctions.ifExtensionAlreadyExists() - returns true if an extension already exists, false Other wise
		return this.getAllExtensions().contains(a);
	}
};


var after_localajaxinit = function(){

	if( window.console && window.console.firebug && window.console.firebug == '1.2.0b7' ){
		alert('This version of firebug is known to break the gui.\n'
			+ 'Please disable firebug & reload ');
		return;
	}

	ASTGUI.Log.Debug('Start localAjaxinit in Parent window');
	//if( typeof readcfg == 'undefined' ){
	//	alert('readcfg undefined');
	//}


	if( sessionData.PLATFORM.isAA50 ){
		_$('mainPageLegaInfo_A').href = 'license.html';
	}

	if( sessionData.PLATFORM.isABE ){ // ABE-1600
		try{
			(function(){
				var all_divs = $('div');
				var i = 0;
				while( all_divs[i] ){
					var adi = all_divs[i];
					var pg = $(adi).attr('page') ;
					if( pg && pg == 'mohfiles.html' ){
						adi.parentNode.removeChild(adi);
						break;
					}
					i++;
				}
			})();
		}catch(err){}
	}


	var loadGUI = function(){
		DOM_accordion_div = _$('accordion_div');
		DOM_mainscreen = _$('mainscreen');
		// Accordion in a few lines :)
			$('div.ui-accordion-link:gt(0)').hide();
			$('div.ui-accordion-desc:gt(0)').hide();
				$(".notinAA50").hide();
				$(".forAA50").hide();
			DOM_accordion_div.style.display = '';
			var loadPanel = function(event){
				var s = ASTGUI.events.getTarget(event);
				if ( $(s).attr("class") != "ui-accordion-link" ) { return; }
				$('div.ui-accordion-desc').hide();
				var f = s.parentNode ;
				var page = $(f).attr("page");
				$(f).find("div").show();
				if( page == 'digital.html' && sessionData.PLATFORM.isAA50 ){
					$(f).find("div")[1].innerHTML = 'Analog ports configuration';
				}
				setTimeout( function(){DOM_mainscreen.src = page ;} , 50 );
			};
			ASTGUI.events.add(DOM_accordion_div, 'click', loadPanel);
		// End of Accordion
	
		DOM_mainscreen.style.left = DOM_accordion_div.offsetWidth + 3;
		DOM_mainscreen.style.top = DOM_accordion_div.offsetTop ;
		miscFunctions.resizeMainIframe();
		window.onresize = miscFunctions.resizeMainIframe;
		window.onunload = function (e) {
			DOM_mainscreen.src = 'blank.html';
		};
		ASTGUI.Log.Debug('calling onLogInFunctions.checkifLoggedIn()');
		onLogInFunctions.checkifLoggedIn();
		if(sessionData.DEBUG_MODE){
			miscFunctions.DEBUG_START();
			$(".debugWindow").show();
		}
	};

	ASTGUI.dialog.waitWhile(' Loading ...');
	setTimeout( loadGUI , 300 );
};
