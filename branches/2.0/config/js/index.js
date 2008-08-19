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
				ASTGUI.debugLog("PING Request: REQUEST FAILED " , 'update');
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
						ASTGUI.debugLog('PING Request: INVALID SESSION' , 'update');
						if( parent.sessionData.DEBUG_MODE ){
							alert('PING Request: INVALID SESSION' + '\n' + 'Click OK to reload');
						}
						window.location.reload(); 
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
					if(!t.toLowerCase().match('pong')){
						ASTGUI.debugLog('PING Request: INVALID SESSION' , 'update');
						if( parent.sessionData.DEBUG_MODE ){
							alert('PING Request: INVALID SESSION' + '\n' + 'Click OK to reload');
						}
						window.location.reload(); return true; 
					}else{
						ASTGUI.debugLog('PING Request: Success' , 'get');
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
			ASTGUI.cookies.setCookie( 'rwaccess' , 'no' );
			return false; // no read/write access to the GUI
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
				var tmp_cbkp = ASTGUI.paths['ConfigBkp'] ;
				if( tmp_cbkp.endsWith('/') ){ tmp_cbkp = tmp_cbkp.rChop('/'); }
				u.new_action('append', 'post_mappings' , 'backups', tmp_cbkp ) ;
				pu = true;
			}
			if( !http_conf.post_mappings.hasOwnProperty('moh') ){
				var tmp_cbkp = ASTGUI.paths.MOH ;
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
		ASTGUI.dialog.waitWhile('Checking write permission for gui folder');
		var rand = Math.round(100000*Math.random());

		ASTGUI.systemCmdWithOutput( "echo '" + rand + "'" , function(s){ // run 'misdn-init scan'
			if( s.contains(rand) ){
				ASTGUI.dialog.waitWhile('detecting Hardware ..');
				ASTGUI.systemCmd( ASTGUI.apps.Ztscan, onLogInFunctions.updatePanels4Platform );
			}else{
				ASTGUI.dialog.alertmsg( 'Asterisk needs write privileges on ' + ASTGUI.paths['guiInstall'] );
				return;
			}
		});
	},

	checkifLoggedIn: function(){
		var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=ping', async: false });
		var resp = s.getResponseHeader("Server");

		onLogInFunctions.detectPlatform(resp); // <-- PLATFORM Detection

		if(s.responseText.toLowerCase().match('pong')){
			ASTGUI.debugLog('Got PONG , session is active');

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
					if( parent.sessionData.DEBUG_MODE ){
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
			ASTGUI.ErrorLog('NO active session : show login page');
			ASTGUI.debugLog('s.responseText is "' + s.responseText + '"' );
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
				ASTGUI.ErrorLog('Error in readcfg.checkEssentials()' + '<BR>error msg: ' + er.description );
			}

			try{
				readcfg.ExtensionsConf();
				if( sessionData.continueParsing == false )return;
			}catch(er){
				ASTGUI.ErrorLog('Error in readcfg.ExtensionsConf()');
			}

			try{
				readcfg.guiPreferencesConf();
				if( sessionData.continueParsing == false )return;
			}catch(er){
				ASTGUI.ErrorLog('Error in readcfg.guiPreferencesConf()');
			}

			try{
				readcfg.httpConf();
			}catch(er){
				ASTGUI.ErrorLog('Error in readcfg.httpConf()');
			}

			try{
				astgui_manageConferences.loadMeetMeRooms();
			}catch(er){
				ASTGUI.ErrorLog('Error in astgui_manageConferences.loadMeetMeRooms()');
			}

			try{
				astgui_manageQueues.loadQueues();
			}catch(er){
				ASTGUI.ErrorLog('Error in astgui_manageQueues.loadQueues()');
			}

			try{
				readcfg.UsersConf();
			}catch(er){
				ASTGUI.ErrorLog('Error in readcfg.UsersConf()');
			}

			try{
				readcfg.MisdnConf();
			}catch(er){
				ASTGUI.ErrorLog('Error in readcfg.MisdnConf()');
			}

		}catch(err){
			ASTGUI.ErrorLog('Error in onLogInFunctions.parseConfigFiles()');
		}finally{
			//DOM_mainscreen.src = 'home.html';
			if( sessionData.continueParsing == false ){
				return;
			}

			sessionData.finishedParsing = true;
			onLogInFunctions.check_WritePermissionsFor_GUI_Folder();
		}
	},

	updatePanels4Platform: function(){
		// 
		// Place holder for Expose only those panels based upon the detected platform
		//
		$(".AdvancedMode").hide();
		$('div.ui-accordion-link').show(); // finally show all panels
		$('#ptopbuttons').show();
		if( ASTGUI.cookies.getCookie('configFilesChanged') == 'yes' ){
			$('#applyChanges_Button').show();
		}else{
			$('#applyChanges_Button').hide();
		}
		miscFunctions.resizeMainIframe();
		ASTGUI.dialog.hide();
		DOM_mainscreen.src = 'welcome.html?status=1';
		readcfg.ztScanConf();
	}
};


var miscFunctions = {
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

	hide_panel: function(fname){ // parent.miscFunctions.hide_panel('page.html')
		var t = $('.ui-accordion-link') ;
		for(var p=0; p < t.length ; p++){
			if( $(t[p].parentNode).attr("page") == fname ){
				$(t[p].parentNode).hide();
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
				return;
			}
		}
	},

	flip_advancedmode: function(){
		if(sessionData.advancedmode == true ){
			$(".AdvancedMode").hide();
			sessionData.advancedmode = false;
		}else{
			$(".AdvancedMode").show();
			sessionData.advancedmode = true;
		}
	},

	applyChanges : function(cb){
		var t = ASTGUI.cliCommand('reload') ;
		var u = _$('applyChanges_Button');
		u.style.display = 'none';
		ASTGUI.cookies.setCookie( 'configFilesChanged' , 'no' );
		ASTGUI.feedback({msg:'Asterisk Reloaded !!', showfor: 3 , color: '#5D7CBA', bgcolor: '#FFFFFF'}) ;

		if( ASTGUI.cookies.getCookie('require_restart') == 'yes'){
			ASTGUI.dialog.alertmsg('The changes you made requires a restart. <BR> Your hardware might not work properly until you reboot !!');
			ASTGUI.cookies.setCookie( 'require_restart' , 'no' );
		}
	},

	logoutFunction : {
		// Object to store all sequence of functions that should execute on logout
		// example if appliance - need to save changes before logout 
		confirmlogout : function(){
			if( ASTGUI.cookies.getCookie('configFilesChanged') == 'yes' ){

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
				if( parent.sessionData.DEBUG_MODE ){
					alert('CountDown complete' + '\n' + 'Click OK to reload');
				}
				top.window.location.reload() ;
			}
		};
		count_down(60);
	},

	reboot_pbx: function( opt ){ // miscFunctions.reboot_pbx
		parent.ASTGUI.yesOrNo({
			msg: (opt && opt.msg) || 'Note: Rebooting appliance will terminate any active calls.' ,
			ifyes: function(){
					parent.ASTGUI.dialog.waitWhile('Rebooting !');
					parent.ASTGUI.systemCmd ('reboot', miscFunctions.AFTER_REBOOT_CMD );
			},
			ifno:function(){
				
			},
			title : 'Reboot now ?',
			btnYes_text :'Reboot Now',
			btnNo_text : (opt && opt.btnNo_text) || 'Cancel'
		});
	},

	getAllDestinations: function(fortbr){ // miscFunctions.getAllDestinations() // --> returns an Array of Objects
	// There are many places in the gui where we want to preset a select box with all possible destinations
	// Ex: in incoming calls, Voicemenus, TimeBased Routing, RingGroups etc etc.
	// this function navigates through all properties of sessionData.pbxinfo and returns an Array of Objects with all the possible destinations
		var tmp = [] ;
		var destination = function(){
			this.optionText = '';
			this.optionValue = '';
		};
		var y = astgui_manageusers.listOfUsers();
			y.each(function(user){
				var f = new destination;
				f.optionText = 'User Extension -- ' + user ;
				f.optionValue = (fortbr)? 'default|' + user + '|1' : 'Goto(default|' + user + '|1)' ;
				tmp.push(f);
				if(!fortbr && sessionData.pbxinfo.users[user].getProperty('hasvoicemail').isAstTrue() ){
					var p_Text = 'User VoiceMailBox ' + user ;
					tmp.push({ optionText: p_Text , optionValue: 'Voicemail(' + user + ',u)' });
				}
			});
		var y = sessionData.pbxinfo.conferences.getOwnProperties();
			y.each(function(meetme){
				var f = new destination;
				f.optionText = 'Conference Room -- ' + meetme ;
				f.optionValue = (fortbr)? ASTGUI.contexts.CONFERENCES + '|' + meetme + '|1' :  'Goto('+ ASTGUI.contexts.CONFERENCES +'|'+ meetme + '|1)';
				tmp.push(f);
			});
		var y = sessionData.pbxinfo.queues.getOwnProperties();
			y.each(function(q){
				var f = new destination;
				f.optionText = 'Queue -- ' + q ;
				f.optionValue = (fortbr)? ASTGUI.contexts.QUEUES + '|' + q + '|1' : 'Goto('+ ASTGUI.contexts.QUEUES +'|'+ q + '|1)';
				tmp.push(f);
			});
		var y = sessionData.pbxinfo.voicemenus.getOwnProperties();
			y.each(function(vmenu){
				var vm_name = sessionData.pbxinfo.voicemenus[vmenu].comment || vmenu ;
				var f = new destination;
				f.optionText = 'VoiceMenu -- ' + vm_name ;
				f.optionValue = (fortbr)? vmenu+ '|s|1' : 'Goto('+ vmenu +'|s|1)';
				tmp.push(f);
			});
		var y = sessionData.pbxinfo.timebasedRules.getOwnProperties();
			y.each(function(tbr){
				var tbr_label = sessionData.pbxinfo.timebasedRules[tbr].label || tbr ;
				var f = new destination;
				f.optionText = 'Time Based Rule -- ' + tbr_label;
				f.optionValue = (fortbr)? tbr + '|s|1' : 'Goto('+ tbr +'|s|1)';
				tmp.push(f);
			});
		var y = sessionData.pbxinfo.ringgroups.getOwnProperties();
			y.each(function(rg){
				var rg_name = sessionData.pbxinfo.ringgroups[rg].NAME || rg ;
				var f = new destination;
				f.optionText = 'Ring Group -- ' + rg_name ;
				f.optionValue = (fortbr)? rg + '|s|1' : 'Goto('+ rg +'|s|1)';
				tmp.push(f);
			});
		var y = sessionData.pbxinfo.vmgroups.getOwnProperties();
			y.each(function( this_vmg_exten ){
				var f = new destination;
				f.optionText = 'VoiceMail Group -- ' + (sessionData.pbxinfo.vmgroups[this_vmg_exten].getProperty('label') || this_vmg_exten ) ;
				f.optionValue = (fortbr) ? ASTGUI.contexts.VoiceMailGroups +'|' + this_vmg_exten + '|1' : 'Goto('+ ASTGUI.contexts.VoiceMailGroups +'|' + this_vmg_exten + '|1)'; ;
				tmp.push(f);
			});

		if( sessionData.pbxinfo['localextensions'].getProperty('defaultDirectory') ){
			var nde = sessionData.pbxinfo['localextensions'].getProperty('defaultDirectory') ;
			var f = new destination;
			f.optionText = 'Names Directory -- ' + nde ;
			f.optionValue = (fortbr) ? ASTGUI.contexts.Directory + '|' + nde + '|1' : 'Goto('+ ASTGUI.contexts.Directory + '|' + nde + '|1)'; ;
			tmp.push(f);
		}

			var f = new destination; // we always point to default|o instead of to where defautl|o points to, so that if when a different user is selected as operator, we do not have to update the menus
			f.optionText = 'Operator';
			f.optionValue = (fortbr)? 'default|o|1' : 'Goto(default|o|1)';
			tmp.push(f);

		if(!fortbr){
			tmp.push({ optionText: 'Hangup' , optionValue: 'Hangup' });
			tmp.push({ optionText: 'Congestion' , optionValue: 'Congestion' });
		}
		return tmp;
	},

	ifExtensionAlreadyExists: function(a){ // miscFunctions.ifExtensionAlreadyExists() - returns true if an extension already exists, false Other wise
		var tmp = [] ;
		tmp = tmp.concat( astgui_manageusers.listOfUsers() );
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

		var tmp_LE = ASTGUI.cloneObject(sessionData.pbxinfo['localextensions']);
		if( tmp_LE.getProperty('defaultDirectory') ){
			tmp.push( tmp_LE.getProperty('defaultDirectory') );
		}
		tmp = tmp.concat( sessionData.pbxinfo.vmgroups.getOwnProperties() );
		tmp = tmp.concat( sessionData.pbxinfo.queues.getOwnProperties() );
		return tmp.contains(a) ;
	}
};


var localajaxinit = function(){

	if( window.console && window.console.firebug && window.console.firebug == '1.2.0b7' ){
		alert('This version of firebug is known to break the gui.\n'
			+ 'Please disable firebug & reload ');
		return;
	}

	ASTGUI.debugLog('Start localAjaxinit in Parent window', 'parse');
	//if( typeof readcfg == 'undefined' ){
	//	alert('readcfg undefined');
	//}
	$.getScript( 'js/guiversion.js', function(){
		sessionData.gui_version = gui_version ;
	});
	var loadGUI = function(){
		DOM_accordion_div = _$('accordion_div');
		DOM_mainscreen = _$('mainscreen');
		// Accordion in a few lines :)
			$('div.ui-accordion-link:gt(0)').hide();
			$('div.ui-accordion-desc:gt(0)').hide();
			DOM_accordion_div.style.display = '';
			var loadPanel = function(event){
				var s = ASTGUI.events.getTarget(event);
				if ( $(s).attr("class") != "ui-accordion-link" ) { return; }
				$('div.ui-accordion-desc').hide();
				var f = s.parentNode ;
				var page = $(f).attr("page");
				DOM_mainscreen.src = page ;
				$(f).find("div").show();
			};
			ASTGUI.events.add(DOM_accordion_div, 'click', loadPanel);
		// End of Accordion
	
		DOM_mainscreen.style.left = DOM_accordion_div.offsetWidth + 3;
		DOM_mainscreen.style.top = DOM_accordion_div.offsetTop ;
		miscFunctions.resizeMainIframe();
		window.onresize = miscFunctions.resizeMainIframe;
		ASTGUI.debugLog('calling onLogInFunctions.checkifLoggedIn()', 'parse');
		onLogInFunctions.checkifLoggedIn();
		if(sessionData.DEBUG_MODE){
			miscFunctions.DEBUG_START();
			$(".debugWindow").show();
		}
	};

	ASTGUI.dialog.waitWhile(' Loading ...');
	setTimeout( loadGUI , 300 );
};
