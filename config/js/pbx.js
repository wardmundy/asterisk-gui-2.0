/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * core parsing functions used in index.html
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

// this file is intended to be included in index.html only
// all the functions listed here usally updates the sessionData object in index.html
// if you are including this file in an iframe page - you are probably doing something wrong

readcfg = {	// place where we tell the framework how and what to parse/read from each config file
		// each function would read a config file and updates the sessionData.pbxinfo
	checkEssentials: function(){ //readcfg.checkEssentials();
		// check whether the config files are in proper format and have every thing needed for the gui to function properly
		var ecnf = config2json({ filename:'extensions.conf', usf:1 });
		if( !ecnf.hasOwnProperty('general') || !ecnf.hasOwnProperty('globals') ){
			var u = new listOfSynActions('extensions.conf');
			if( !ecnf['globals'] ){
				u.new_action('newcat', 'globals', '', '');
			}
			if( !ecnf['general'] ){
				u.new_action('newcat', 'general', '', '');
				u.new_action('append', 'general', 'static', 'yes');
				u.new_action('append', 'general', 'writeprotect', 'no');
				u.new_action('append', 'general', 'clearglobalvars', 'yes');
			}
			sessionData.continueParsing = false ;
			ASTGUI.dialog.waitWhile("Adding 'general' context to extensions.conf");
			u.callActions();
			if( parent.sessionData.DEBUG_MODE ){
				alert('updated general context in extensions.conf' + '\n' + 'Click OK to reload');
			}
			window.location.reload();
			return;
		}

		if( ecnf.hasOwnProperty('general') && ecnf.general.getProperty('clearglobalvars') != 'yes' ){
			var u = new listOfSynActions('extensions.conf');
			u.new_action('update', 'general', 'clearglobalvars', 'yes');
			u.callActions();
			sessionData.continueParsing = false ;
			if( parent.sessionData.DEBUG_MODE ){
				alert('updated clearglobalvars in extensions.conf' + '\n' + 'Click OK to reload');
			}
			window.location.reload();
			return;
		}

		if( !ecnf[ASTGUI.contexts.CONFERENCES] || !ecnf[ASTGUI.contexts.RingGroupExtensions] || !ecnf[ASTGUI.contexts.QUEUES] || !ecnf['default'] || !ecnf[ASTGUI.contexts.VoiceMenuExtensions] || !ecnf[ASTGUI.contexts.VoiceMailGroups] || !ecnf[ASTGUI.contexts.Directory] ){
			var u = new listOfSynActions('extensions.conf');
			if( !ecnf['default'] ){
				u.new_action('newcat', 'default', '', '') ;
			}
			if( !ecnf[ASTGUI.contexts.CONFERENCES] ){
				u.new_action('newcat', ASTGUI.contexts.CONFERENCES, '', '');
			};
			if( !ecnf[ASTGUI.contexts.RingGroupExtensions] ){
				u.new_action('newcat', ASTGUI.contexts.RingGroupExtensions, '', '');
			}
			if( !ecnf[ASTGUI.contexts.QUEUES] ){
				u.new_action('newcat', ASTGUI.contexts.QUEUES, '', '');
			}
			if( !ecnf[ASTGUI.contexts.VoiceMenuExtensions] ){
				u.new_action('newcat', ASTGUI.contexts.VoiceMenuExtensions, '', '');
			}
			if( !ecnf[ASTGUI.contexts.VoiceMailGroups] ){
				u.new_action('newcat', ASTGUI.contexts.VoiceMailGroups, '', '');
			}
			if( !ecnf[ASTGUI.contexts.Directory] ){
				u.new_action('newcat', ASTGUI.contexts.Directory, '', '');
			}
			sessionData.continueParsing = false ;
			ASTGUI.dialog.waitWhile(" Adding required contexts to extensions.conf ");
			u.callActions();
			if( parent.sessionData.DEBUG_MODE ){
				alert('updated default categories in extensions.conf' + '\n' + 'Click OK to reload');
			}
			window.location.reload();
			return;
		}

		if( !ecnf[ASTGUI.contexts.guitools] ){ // if No guitools context
			sessionData.continueParsing = false;
			(function(){
				ASTGUI.dialog.waitWhile('Adding GUI-Tools context to extensions.conf');
				var after = function(){
					var rld = function(){
						var t = ASTGUI.cliCommand('dialplan reload') ;
						if( parent.sessionData.DEBUG_MODE ){
							alert('updated guitools in extensions.conf' + '\n' + 'Click OK to reload');
						}
						top.window.location.reload();
					};
					setTimeout( rld , 1000 );
				};
				var x = new listOfActions();
				x.filename('extensions.conf');
				x.new_action('newcat', ASTGUI.contexts.guitools , '', '');
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'executecommand,1,System(${command})' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'executecommand,n,Hangup()' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'record_vmenu,1,Answer' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'record_vmenu,n,Playback(vm-intro)' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'record_vmenu,n,Record(${var1})' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'record_vmenu,n,Playback(vm-saved)' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'record_vmenu,n,Playback(vm-goodbye)' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'record_vmenu,n,Hangup' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'play_file,1,Answer' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'play_file,n,Playback(${var1})' );
				x.new_action( 'append', ASTGUI.contexts.guitools , 'exten', 'play_file,n,Hangup' );
				x.callActions(after);
			})();
			return;
		}

		if( !ecnf[ 'macro-' + ASTGUI.contexts.dialtrunks] ){ // if No guitools context
			sessionData.continueParsing = false;
			(function(){
				ASTGUI.dialog.waitWhile('Adding Trunkdial-Failover Macro to extensions.conf');
				var after = function(){
					setTimeout( function(){
						var t = ASTGUI.cliCommand('dialplan reload') ;
						if( parent.sessionData.DEBUG_MODE ){
							alert('updated macro-trunkdial in extensions.conf' + '\n' + 'Click OK to reload');
						}
						top.window.location.reload();
					}, 1000);
				}
				var x = new listOfActions();
				x.filename('extensions.conf');
				var cat = 'macro-' + ASTGUI.contexts.dialtrunks;
				x.new_action('newcat', cat , '', '');
				x.new_action( 'append', cat , '; Macro by', " Brandon Kruse <bkruse@digium.com> & Matthew O'Gorman mogorman@digium.com" );
				x.new_action( 'append', cat , 'exten', 's,1,Set(CALLERID(num)=${IF($[${LEN(${CID_${CALLERID(num)}})} > 2]?${CID_${CALLERID(num)}}:)})');
				x.new_action( 'append', cat , 'exten', 's,n,GotoIf($[${LEN(${CALLERID(num)})} > 6]?1-dial,1)');
				x.new_action( 'append', cat , 'exten', 's,n,Set(CALLERID(all)=${IF($[${LEN(${CID_${ARG3}})} > 6]?${CID_${ARG3}}:${GLOBAL_OUTBOUNDCID})})');
				x.new_action( 'append', cat , 'exten', 's,n,Goto(1-dial,1)');
				x.new_action( 'append', cat , 'exten', '1-dial,1,Dial(${ARG1})');
				x.new_action( 'append', cat , 'exten', '1-dial,n,Gotoif(${LEN(${ARG2})} > 0 ?1-${DIALSTATUS},1:1-out,1)');
				x.new_action( 'append', cat , 'exten', '1-CHANUNAVAIL,1,Dial(${ARG2})');
				x.new_action( 'append', cat , 'exten', '1-CHANUNAVAIL,n,Hangup()');
				x.new_action( 'append', cat , 'exten', '1-CONGESTION,1,Dial(${ARG2})');
				x.new_action( 'append', cat , 'exten', '1-CONGESTION,n,Hangup()');
				x.new_action( 'append', cat , 'exten', '1-out,1,Hangup()');
				x.callActions(after);
			})();
			return;
		}

		(function(){
			var tmp_file = ASTGUI.globals.zaptelIncludeFile;
			var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=getconfig&filename=' + tmp_file , async: false }).responseText;
			if( s.contains('Response: Error') && s.contains('Message: Config file not found') ){
				ASTGUI.miscFunctions.createConfig( tmp_file , function(){
					var u = new listOfSynActions(tmp_file) ;
					u.new_action('delcat', 'general', "", ""); 
					u.new_action('newcat', 'general', "", ""); 
					u.new_action('update', 'general', '#include "../zaptel.conf" ;', ' ;');
					u.callActions();
				});
				return;
			}else{
				var q = config2json({ configFile_output:s , usf:0 });
				if( q.hasOwnProperty('general') ){
					q.general.each(function(line){
						if ( !line.beginsWith('fx') ){ return ;}
						if( line.beginsWith('fxoks=') || line.beginsWith('fxsks=') ){
							var ksports = ASTGUI.miscFunctions.chanStringToArray( line.afterChar('=') );
							sessionData.PORTS_SIGNALLING.ks = sessionData.PORTS_SIGNALLING.ks.concat(ksports);
						}
						if( line.beginsWith('fxols=') || line.beginsWith('fxsls=') ){
							var lsports = ASTGUI.miscFunctions.chanStringToArray( line.afterChar('=') );
							sessionData.PORTS_SIGNALLING.ls = sessionData.PORTS_SIGNALLING.ls.concat(lsports);
						}
					});
				}
			}
		})();

		sessionData.continueParsing = true ;
	}, // end of readcfg.checkEssentials();

	guiPreferencesConf: function(){ //readcfg.guiPreferencesConf();
		ASTGUI.debugLog("AJAX Request : reading '" +  ASTGUI.globals.configfile + "'" , 'get');
		var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=getconfig&filename=' + ASTGUI.globals.configfile , async: false }).responseText;
		if( s.contains('Response: Error') && s.contains('Message: Config file not found') ){
			sessionData.continueParsing = false ;
			ASTGUI.dialog.waitWhile(" Creating a config file to store GUI Preferences");
			ASTGUI.miscFunctions.createConfig( ASTGUI.globals.configfile, function(){
				if( parent.sessionData.DEBUG_MODE ){
					alert('created config file ' + ASTGUI.globals.configfile + '\n' + 'Click OK to reload');
				}
				window.location.reload();
			});
			return;
		}

		var gp = config2json({ configFile_output: s , usf:1 });
		if( !gp.hasOwnProperty('general') ){
			var u = new listOfSynActions(ASTGUI.globals.configfile) ;
			u.new_action ('newcat', 'general', '', '');
			u.callActions ();
			u.clearActions ();
			u.new_action('append', 'general', 'ue_start', '6000');
			u.new_action('append', 'general', 'ue_end', '6299');
			u.new_action('append', 'general', 'mm_start', '6300');
			u.new_action('append', 'general', 'mm_end', '6399');
			u.new_action('append', 'general', 'vme_start', '7000');
			u.new_action('append', 'general', 'vme_end', '7100');
			u.callActions ();
			u.clearActions ();
			u.new_action('append', 'general', 'rge_start', '6400');
			u.new_action('append', 'general', 'rge_end', '6499');
			u.new_action('append', 'general', 'qe_start', '6500');
			u.new_action('append', 'general', 'qe_end', '6599');
			u.new_action('append', 'general', 'vmg_start', '6600');
			u.new_action('append', 'general', 'vmg_end', '6699');
			u.callActions ();
			sessionData.GUI_PREFERENCES = new ASTGUI.customObject ;
			sessionData.GUI_PREFERENCES.updateProperties({ ue_start : '6000', ue_end : '6299', mm_start : '6300', mm_end : '6399', vme_start : '7000', vme_end : '7100', rge_start : '6400' , rge_end : '6499' , qe_start : '6500' , qe_end : '6599', vmg_start : '6600' , vmg_end : '6699' });
		}else{
			sessionData.GUI_PREFERENCES = gp['general'] ;
		}
		sessionData.continueParsing = true ;
	}, // end of readcfg.guiPreferencesConf();

	ExtensionsConf: function(){ //readcfg.ExtensionsConf();
		var c = config2json({filename:'extensions.conf', usf:0});
		//	look for numberplans, voicemenus, DID_trunk_x (incoming rules), timebasedrules, ringgroups, 
		//	and store the information in the following objects
		//		==> sessionData.pbxinfo.dialplans
		//		==> sessionData.pbxinfo.voicemenus
		//		==> sessionData.pbxinfo.incomingrules
		//		==> sessionData.pbxinfo.timebasedrules
		//		==> sessionData.pbxinfo.ringgroups
		//
		//	look for localextensions, Conferences, Queues under context [default] and store information in 
		//		==> sessionData.pbxinfo.localextensions
		//		==> sessionData.pbxinfo.conferences
		//		==> sessionData.pbxinfo.queues
		sessionData.pbxinfo['voicemenus'] = new ASTGUI.customObject; // reset all voicemenus data
		sessionData.pbxinfo['callingPlans'] = new ASTGUI.customObject; // reset all dialplan data
		sessionData.pbxinfo['callingRules'] = new ASTGUI.customObject; // reset all dialplan data
//		sessionData.pbxinfo['incomingrules'] = new ASTGUI.customObject; // reset all incoming rules data
		sessionData.pbxinfo['localextensions'] = new ASTGUI.customObject;
		sessionData.pbxinfo['conferences'] = new ASTGUI.customObject;
		sessionData.pbxinfo['vmgroups'] = new ASTGUI.customObject;
		sessionData.pbxinfo['queues'] = new ASTGUI.customObject;
		sessionData.pbxinfo['GLOBALS'] = new ASTGUI.customObject; // store extensions.conf --> [globals]
		sessionData.pbxinfo['ringgroups'] = new ASTGUI.customObject;
		sessionData.pbxinfo['timebasedRules'] = new ASTGUI.customObject;

		for(var d in c){ if(c.hasOwnProperty(d)) {
			// note: remember c[d] is an Array and is not an Object (we used usf:0)
			if( d == 'default' ){ 	// look for conferences, queues, and localextensions (voicemail, operator etc)
				astgui_parseDefaultContext( c[d] );
				continue;
			}
			if( d == ASTGUI.contexts.CONFERENCES ){
				continue;
			}
			if( d == ASTGUI.contexts.QUEUES ){
				continue;
			}
			if( d == ASTGUI.contexts.VoiceMenuExtensions ){
				continue;
			}
			if ( d == ASTGUI.contexts.VoiceMailGroups ){
				astgui_manageVMgroups.parseContext(c[d]);
			}
			if( d == 'globals' ){ // look for outboundcid of all users and globaloutboungcid
				astgui_parseGlobalContext( c[d] );
				continue;
			}
			if( d == ASTGUI.contexts.Directory){
				(function(){
					for ( var ci = 0 ; ci < c[d].length ; ci++ ){
						if( c[d][ci].toLowerCase().contains('directory(') &&   c[d][ci].toLowerCase().contains('default') ){
							sessionData.pbxinfo['localextensions']['defaultDirectory'] = ASTGUI.parseContextLine.getExten( c[d][ci] );
							break;
						}
					}
				})();
				continue;
			}
			if( d.beginsWith(ASTGUI.contexts.VoiceMenuPrefix) ){ // if context is a voicemenu 
				sessionData.pbxinfo['voicemenus'][d] = new ASTGUI.customObject; // create new object for this voicemenu
				sessionData.pbxinfo['voicemenus'][d] = astgui_manageVoiceMenus.parseContext( c[d] );
				continue;
			}

			if( d.beginsWith( ASTGUI.contexts.RingGroupPrefix ) ){ // if context is a ringGroup
				sessionData.pbxinfo['ringgroups'][d] = new ASTGUI.customObject;
				sessionData.pbxinfo['ringgroups'][d] = astgui_manageRingGroups.parseContext(d, c[d], c[ASTGUI.contexts.RingGroupExtensions]);  // create new object for this ringgroup
				continue;
			}

			if( d.beginsWith( ASTGUI.contexts.CallingPlanPrefix ) ){ // if context is a callplan/dialplan == set of calling rules
				sessionData.pbxinfo['callingPlans'][d] = new ASTGUI.customObject;
				sessionData.pbxinfo['callingPlans'][d] = astgui_manageCallPlans.parseContext( c[d] );
				continue;
			}

			if( d.beginsWith( ASTGUI.contexts.CallingRulePrefix ) ){ // if context is a calling Rule
				sessionData.pbxinfo['callingRules'][d] = new ASTGUI.customObject; // create new object for this dialplan
				// sessionData.pbxinfo['callingRules'][d] = astgui_manageCallingRules.parseContext( c[d] );
				sessionData.pbxinfo['callingRules'][d] = c[d] ;
				continue;
			}

// 			if( d.beginsWith(ASTGUI.contexts.TrunkDIDPrefix) && !d.contains( '_' + ASTGUI.contexts.TimeIntervalPrefix ) ){ // if is a incoming rules context 
// 				sessionData.pbxinfo['incomingrules'][d] = new ASTGUI.customObject; // create new object for this dialplan
// 				sessionData.pbxinfo['incomingrules'][d] = astgui_manageIncomingRules.parseContext(d, c[d] );
// 				continue;
// 			}

			if(d.beginsWith(ASTGUI.contexts.TimeBasedRulePrefix) ){
				continue ; // depricated in favor of time frames
				// sessionData.pbxinfo['timebasedRules'][d] = new ASTGUI.customObject; // create new object for this time based rule
				// sessionData.pbxinfo['timebasedRules'][d] = astgui_manageTimeBasedRules.parseContext( d , c[d] );
			}
		}}
		ASTGUI.debugLog('parsed all contexts in extensions.conf');
		(function(){ // parse voicemenu extensions
			var vm = c[ASTGUI.contexts.VoiceMenuExtensions] ;
			var vm_default = c['default'] ; // Backward compatibility for old GUI
			vm = vm.concat(vm_default); // old gui used to create voiceMenu Extensions in [default] as opposed to in [voicemenus]
			vm.each( function(line){
				if( line.contains('Goto') && line.contains(ASTGUI.contexts.VoiceMenuPrefix) ){
					//var this_exten = ASTGUI.parseContextLine.getExten(line);
					var this_menuName = ASTGUI.parseContextLine.getArgs(line)[0];
					if( sessionData.pbxinfo['voicemenus'].hasOwnProperty(this_menuName) ){
						sessionData.pbxinfo['voicemenus'][this_menuName].alias_exten = line ;
					}
				}
			});
		})();
		(function(){// backward compatibility for old Meetmes
			// [default]  ---   exten => 6000,1,MeetMe(${EXTEN}|MI) 
			var df = c['default'] ;
			df.each( function(line){
				if( line.contains( ',1,MeetMe(${EXTEN}' ) ){
					var mm_ext = ASTGUI.parseContextLine.getExten(line) ;
					var tmp = new ASTGUI.customObject; 
						tmp.configOptions = line.afterChar('=');
						tmp.pwdString = '' ;
						tmp.adminOptions = '' ;
					if( !sessionData.pbxinfo.conferences.hasOwnProperty(mm_ext) ){
						sessionData.pbxinfo.conferences[mm_ext] = tmp ;
					}
				}
			} );
		})();
		(function(){// backward compatibility for old Queues
			// [default]  ---   exten = 6001,1,Queue(${EXTEN})
			var df = c['default'] ;
			df.each( function(line){
				if( line.contains( ',1,Queue(${EXTEN})') || line.contains(',1,agentlogin(') || line.contains(',1,agentcallbacklogin(') ){
					var q_ext = ASTGUI.parseContextLine.getExten(line) ;
					var tmp = new ASTGUI.customObject; 
						tmp.configLine = line.afterChar('=');
						tmp.isOLDGUI = true ;
					if( !sessionData.pbxinfo.queues.hasOwnProperty(q_ext) ){
						sessionData.pbxinfo.queues[q_ext] = tmp ;
					}
				}
			} );
		})();

		(function(){// backward compatibility for old RingGroups
			// [default]  ---   exten = 6010,1,Goto(ringroups-custom-1|s|1)
			var df = c['default'] ;
			df.each( function(line){
				if( line.contains( ',1,Goto(ringroups-custom-' ) ){
					var rg_ext = ASTGUI.parseContextLine.getExten(line) ;
					var rg_name = line.betweenXY('(', '|') ; //ringroups-custom-1
					if( !sessionData.pbxinfo.ringgroups.hasOwnProperty(rg_name) ){
						var tmp = {
							NAME : rg_name,
							strategy : '',
							members : [],
							extension : rg_ext ,
							ringtime : '',
							fallback : '',
							isOLDRG : true
						};
						sessionData.pbxinfo['ringgroups'][rg_name] = ASTGUI.toCustomObject(tmp);
					}else{
						sessionData.pbxinfo['ringgroups'][rg_name].extension = rg_ext;
						sessionData.pbxinfo['ringgroups'][rg_name].isOLDRG = true;
					}
				}
			} );
		})();
	}, // end of readcfg.ExtensionsConf();

	httpConf: function(){ // readcfg.httpConf();
		var c = config2json({filename:'http.conf', usf:1});
		if( c.hasOwnProperty('general') && c['general'].hasOwnProperty('prefix') ) {	
			sessionData.httpConf.prefix = c['general']['prefix'] ;
		}
		if( c.hasOwnProperty('post_mappings') ) {
			sessionData.httpConf.postmappings_defined = true ;
			var e = c['post_mappings'];
			for(var d in e){ if(e.hasOwnProperty(d)) {
				sessionData.httpConf.uploadPaths[d] = e[d] ;
			}}
		}
	},

	UsersConf: function(){ // readcfg.UsersConf();
		var c = config2json({filename:'users.conf', usf:1});
		// we should actually be using usf:0 to handle cases like 'allow', 'disallow' defined in multiple lines
		// but for the time being we will continue with the assumption that they are all defined in one line

		sessionData.pbxinfo['users'] = new ASTGUI.customObject ; // reset all users info
		if(!sessionData.pbxinfo['trunks']){ sessionData.pbxinfo['trunks'] = new ASTGUI.customObject ; }
		sessionData.pbxinfo['trunks']['analog'] = new ASTGUI.customObject ;
		sessionData.pbxinfo['trunks']['sip'] = new ASTGUI.customObject;
		sessionData.pbxinfo['trunks']['iax'] = new ASTGUI.customObject;
		sessionData.pbxinfo['trunks']['pri'] = new ASTGUI.customObject;
		sessionData.pbxinfo['trunks']['providers'] = new ASTGUI.customObject;

		for(var d in c){ if(c.hasOwnProperty(d)) {
			if(d=='general'){ continue; }

			if( c[d].hasOwnProperty('provider') ){
				// if is a service provider (will be handled by providers.js from trunks_sps.html )
				sessionData.pbxinfo.trunks.providers[d] = new ASTGUI.customObject ;
				sessionData.pbxinfo['trunks']['providers'][d] = c[d];
				continue ;
			}

			if( c[d].hasOwnProperty('hasexten') && c[d]['hasexten'] == 'no' && !d.beginsWith('span_') ){ // if context is a trunk - could be a analog, iax, sip
				if( c[d]['hasiax'] == 'yes' ){ // if the context is for an iax trunk
					sessionData.pbxinfo['trunks']['iax'][d] = c[d] ;
					continue;
				}
				if( c[d]['hassip'] == 'yes' ){ // if the context is for an sip trunk
					sessionData.pbxinfo['trunks']['sip'][d] = c[d];
					continue;
				}
				if( c[d]['zapchan'] && (!c[d]['hasiax'] || c[d]['hasiax'] =='no') && (!c[d]['hassip'] || c[d]['hassip'] =='no')){
					// if is an analog trunk - note that here we are NOT expecting a 'FXO channel(FXS signalled) on a T1/E1'
					// we assume that all the ports in zapchan are actual analog FXO ports
					// a trunk for T1/E1 analog channels would begin with 'span_'
					sessionData.pbxinfo['trunks']['analog'][d] = c[d];
					continue;
				}
			}

			if( d.beginsWith('span_') && c[d]['zapchan'] ){ 
				sessionData.pbxinfo['trunks']['pri'][d] = c[d];
				continue;
			}

			if( c[d].hasOwnProperty('context') && c[d]['context'].beginsWith(ASTGUI.contexts.TrunkDIDPrefix)  ){
				// some providers like voicepulse requires the trunk context to be named as 'voicepulse'
				// which might not be in the trunk_x format
				// so check whether context beings with 'DID_' and check for whether it is an iax/sip trunk
				if(c[d].hasOwnProperty('hassip') && c[d]['hassip'] == 'yes' ){
					sessionData.pbxinfo['trunks']['sip'][d] = c[d];
					continue;
				}
				if(c[d].hasOwnProperty('hasiax') && c[d]['hasiax'] == 'yes' ){
					sessionData.pbxinfo['trunks']['iax'][d] = c[d];
					continue;
				}
			}


			//if( !d.beginsWith('span_') && !d.beginsWith('trunk_') && c[d].hasOwnProperty('context') && c[d]['context'].beginsWith(ASTGUI.contexts.CallingPlanPrefix) ){ // if is none of above we can assume it is a user context
			// TODO : we can also base the logic on 'hasexten' , cause all trunks have hasexten='yes' and users don't
			if( !d.beginsWith('span_') && !d.beginsWith('trunk_') ){ // if is none of above we can assume it is a user context
				sessionData.pbxinfo['users'][d] = c[d];
				continue;
			}
		}}
	}, // end of readcfg.UsersConf();

	ztScanConf: function(){ // readcfg.ztScanConf();
		// reads ztscan.conf and updates sessionData.FXO_PORTS_DETECTED and sessionData.FXS_PORTS_DETECTED
		// reads ASTGUI.globals.hwcfgFile and looks for analog hardware changes
		sessionData.FXO_PORTS_DETECTED = [];
		sessionData.FXS_PORTS_DETECTED = [];
		var y;
		var c = config2json({filename:'ztscan.conf', usf:0});
		for( var d in c ){ if (c.hasOwnProperty(d) ) {
			c[d].each( function( item ) {
				if( item.beginsWith('port=') && item.contains('FXO') && !item.contains('FAILED') ){ // we are looking for item if it is in the format 'port=4,FXO'
					y = item.betweenXY('=',',');
					sessionData.FXO_PORTS_DETECTED.push(String(y));
				}
				if( item.beginsWith('port') && item.contains('FXS') && !item.contains('FAILED') ){ // we are looking for item if it is in the format 'port=4,FXS'
					y = item.betweenXY('=',',');
					sessionData.FXS_PORTS_DETECTED.push(String(y));
				}
			});
		}}

		// Look for Changes in Analog Hardware ports
		var CONFIGURED_FXSPORTS = '';
		var CONFIGURED_FXOPORTS = '';
		var n = config2json({filename: ASTGUI.globals.hwcfgFile, usf:1});
		for( var l in n ){ if(n.hasOwnProperty(l)){ // l is location
			if(l=='ANALOGPORTS'){
				CONFIGURED_FXSPORTS = n[l].getProperty('FXS');
				CONFIGURED_FXOPORTS = n[l].getProperty('FXO');
			}
		}}

		if( CONFIGURED_FXOPORTS != sessionData.FXO_PORTS_DETECTED.join(',') || CONFIGURED_FXSPORTS != sessionData.FXS_PORTS_DETECTED.join(',') ){
			var message = 'Changes detected in your Analog Hardware !! <BR><BR>'
				+ 'You will now be redirected to the hardware configuration page';
			ASTGUI.yesOrNo({
				btnYes_text : 'Ok' ,
				title: 'Hardware changes detected ! ' ,
				msg: message ,
				ifyes: function(){
					miscFunctions.click_panel('digital.html');
				},
				ifno: function(){ } ,
				hideNo: true
			});
		}
	} // end of readcfg.ztScanConf();
}; // end of readcfg


astgui_parseDefaultContext = function( cxt ){ 
	// takes the default context cxt array and looks for any queues, Operator Extensions, VoiceMail extension
	// and updates the sessionData.pbxinfo accordingly
	cxt.each( function(line){
		// sessionData.pbxinfo['localextensions'] = {}; 
		// sessionData.pbxinfo['queues'] = {};
		if( line.beginsWith('exten=') && line.contains(',1,VoiceMailMain') ){ // if line is in the format 'exten=XXXXXX,1,VoiceMailMain'
			sessionData.pbxinfo['localextensions']['VoiceMailMain'] = line.afterChar('=') ;
			return true;
		}

		if( line.beginsWith('exten=o,1') ){ // if line is in the format 'exten=o,1,Goto(default,6000,1)'
			sessionData.pbxinfo['localextensions']['Operator'] = ASTGUI.parseContextLine.getAppWithArgs( line ); // Goto(default,6000,1)
			return true;
		}

	} );
};



astgui_parseGlobalContext = function(cxt){
	cxt.each( function(line){
		if( line.beginsWith(ASTGUI.globals.obcidstr) || line.beginsWith(ASTGUI.globals.obcidUsrPrefix) ){
			var x = line.beforeChar('=').trim();
			var y = line.afterChar('=').trim();
			sessionData.pbxinfo.GLOBALS[x] = y;
		}
	});
};




astgui_manageusers  = { // all the functions related to user management would reside in this object

	getOBCID_user: function(user){ // returns outbound callerid of the specified user
		return sessionData.pbxinfo['GLOBALS'].getProperty( ASTGUI.globals.obcidUsrPrefix + user ) ;
	},

	deleteuser: function(user, deletevm, cb){ // delete the specified user - usage :: if( astgui_manageusers.deletuser('6001') ){ success };
		var u = new listOfSynActions('users.conf') ;
			u.new_action('delcat', user, '', '');
		u.callActions();
		u.clearActions('extensions.conf');
			u.new_action('delete', 'globals', ASTGUI.globals.obcidUsrPrefix + user, '');
		u.callActions();
		delete sessionData.pbxinfo['users'][user] ;
		

		var qs_x = new listOfActions('queues.conf');
		var qs = config2json({filename:'queues.conf', usf:0 }) ;
		for( var Q in qs ){ if( qs.hasOwnProperty(Q) ){
			if( qs[Q].contains('member=Agent/' + user ) ){
				qs_x.new_action('delete', Q , 'member', '','Agent/' + user );
			}
		}}
		
		qs_x.callActions(function(){
			if( deletevm ){
				ASTGUI.systemCmd('rm ' + ASTGUI.paths['voicemails_dir'] + user + ' -rf', cb);
			}else{
				cb();
			}
		});
	},

	listOfUsers: function(){ // returns an array with list of users - useful for listing available users in a select box etc.
		//sessionData.pbxinfo.users = ASTGUI.toCustomObject(sessionData.pbxinfo.users);
		// astgui_manageusers.listOfUsers();
		return ( sessionData.pbxinfo.users && sessionData.pbxinfo.users.getOwnProperties && sessionData.pbxinfo.users.getOwnProperties() ) || [];
	},

	getUserDetails: function(user){ // returns an object with the specified user details, if the specified user is not found returns null ;
		return sessionData.pbxinfo.users[user] || null ;
	},

	addUser: function(exten, userinfo, cb){ // adds new user 'exten' - userinfo object has all the properties, cb is the callback function
		// usage:: astgui_manageusers.addUser('6666', {'callwaiting': 'no', 'signalling' : 'fxo_ls'}, cb ); // cb is callback function
		//
		// Warning: this functions deletes any existing user 'exten'
		// note: 	this function updates sessionData.pbxinfo['users'] before actually making the ajax requests
		//		we need to address this issue at some point in future
		userinfo = ASTGUI.toCustomObject(userinfo) ;
		var disallow = userinfo.getProperty('disallow') || 'all' ;
		var allow = userinfo.getProperty('allow') || 'all' ;
		sessionData.pbxinfo['users'][exten] = userinfo ;
		sessionData.pbxinfo['users'][exten]['disallow'] = disallow ;
		sessionData.pbxinfo['users'][exten]['allow'] = allow ;
		delete userinfo.disallow ;
		delete userinfo.allow ;
		var x = new listOfActions();
		x.filename('users.conf');
		x.new_action('delcat', exten, '', '');
		x.new_action('newcat', exten, '', '');
		x.new_action('append', exten, 'username', exten );
		x.new_action('append', exten, 'transfer', 'yes' );
		x.new_action('append', exten, 'disallow', disallow ); // makesure 'disallow' is added before 'allow'
		x.new_action('append', exten, 'allow', allow );
		x.new_action('append', exten, 'mailbox', userinfo.mailbox || exten );
		sessionData.pbxinfo['users'][exten]['mailbox'] = userinfo.mailbox || exten ;

		x.new_action('append', exten, 'call-limit', '100' );
		sessionData.pbxinfo['users'][exten]['mailbox'] = '100' ;


		if(userinfo.mailbox) delete userinfo.mailbox;
		for( var d in userinfo ){ if( userinfo.hasOwnProperty(d) ) {
			x.new_action( 'append', exten, d, userinfo[d] );
		}}
		x.callActions(cb); // where after is the callback function
	},

	editUserProperty: function(p){ // update the value of an existing property, adds that property if that property does not currently exist.
		// usage:: astgui_manageusers.editUserProperty({ user:'6001', property: 'allow', value: 'all' });

		if(!sessionData.pbxinfo['users'][p.user]) { // if specified user does not exist
			return false;
		}
		var u = ASTGUI.updateaValue({ file: 'users.conf', context: p.user, variable: p.property, value: p.value }) ;
		if(u){
			try{ sessionData.pbxinfo['users'][p.user][p.property] = p.value ; } catch(err){ }
			return true;
		}else{
			return false;
		}
	}
};


astgui_managetrunks  = { // all the functions related to managing trunks would reside in this object

	deletetrunk: function(trunk){ // delete the specified trunk - usage :: if( astgui_managetrunks.deletetrunk('trunk_1') ){ success };
		var u = new listOfSynActions('users.conf') ;
		u.new_action('delcat', trunk, '', ''); 
		u.callActions();

		var EXT_CNF = config2json({filename:'extensions.conf', usf:0 }) ;
		var v = new listOfSynActions('extensions.conf') ;
		v.new_action('delete', 'globals', trunk , '' );
		for( var ct in EXT_CNF){ if( EXT_CNF.hasOwnProperty(ct) ){
			if( ct == ASTGUI.contexts.TrunkDIDPrefix + trunk || ct.beginsWith( ASTGUI.contexts.TrunkDIDPrefix + trunk + '_' ) ){
				v.new_action('delcat', ct , '' , '' );
			}
		}}
		v.callActions();

		try{
			if(sessionData.pbxinfo['trunks']['analog'][trunk]){ delete sessionData.pbxinfo['trunks']['analog'][trunk]; return true; }
			if(sessionData.pbxinfo['trunks']['sip'][trunk]){ delete sessionData.pbxinfo['trunks']['sip'][trunk]; return true; }
			if(sessionData.pbxinfo['trunks']['iax'][trunk]){ delete sessionData.pbxinfo['trunks']['iax'][trunk]; return true; }
			if(sessionData.pbxinfo['trunks']['pri'][trunk]){ delete sessionData.pbxinfo['trunks']['pri'][trunk]; return true; }
			if(sessionData.pbxinfo['trunks']['providers'][trunk]){ delete sessionData.pbxinfo['trunks']['providers'][trunk]; return true; }
		}catch(err){}
		return true;
	},

	listofAllTrunks : function(){
		var x = [];
		return x.concat( this.listOfAnalogTrunks(), this.listOfSIPTrunks(), this.listOfIAXTrunks(), this.listOfPRITrunks(), this.listOfProviderTrunks() );
	},

	listOfProviderTrunks : function(){
		var list =[];
		try{
			for(var item in sessionData.pbxinfo.trunks.providers){ if(sessionData.pbxinfo.trunks.providers.hasOwnProperty(item)){
				list.push(item);
			}}
		} catch (err) { return []; }
		return list;
	},

	listOfAnalogTrunks: function(){ // astgui_managetrunks.listOfAnalogTrunks() ---> returns 'list of AnalogTrunks array'
		var list =[];
		try{
			for(var item in sessionData.pbxinfo.trunks.analog){ if(sessionData.pbxinfo.trunks.analog.hasOwnProperty(item)){
				list.push(item);
			}}
		} catch (err) { return []; }
		return list;
	},

	listOfSIPTrunks: function(){ // returns an array with list of SIPTrunks 
		var list =[];
		try{
			for(var item in sessionData.pbxinfo.trunks.sip){ if(sessionData.pbxinfo.trunks.sip.hasOwnProperty(item)){
				list.push(item);
			}}
		} catch (err) { return []; }
		return list;
	},

	listOfIAXTrunks: function(){ // returns an array with list of IAXTrunks 
		var list =[];
		try{
			for(var item in sessionData.pbxinfo.trunks.iax){ if(sessionData.pbxinfo.trunks.iax.hasOwnProperty(item)){
				list.push(item);
			}}
		} catch (err) { return []; }
		return list;
	},

	listOfPRITrunks: function(){ // returns an array with list of PRITrunks 
		var list =[];
		try{
			for(var item in sessionData.pbxinfo.trunks.pri){ if(sessionData.pbxinfo.trunks.pri.hasOwnProperty(item)){
				list.push(item);
			}}
		} catch (err) { return []; }
		return list;
	},

	getTrunkDetails: function(trunk){ // returns an object with the trunk details, if the specified trunk is not found returns null
		try{
			var x = null , tr = new ASTGUI.customObject;
			if( sessionData.pbxinfo.trunks.analog.hasOwnProperty(trunk) ){ x = sessionData.pbxinfo.trunks.analog; } // if is an analog trunk
			else if( sessionData.pbxinfo.trunks.sip.hasOwnProperty(trunk) ){ x = sessionData.pbxinfo.trunks.sip; } // if is a sip trunk
			else if( sessionData.pbxinfo.trunks.iax.hasOwnProperty(trunk) ){ x = sessionData.pbxinfo.trunks.iax; } // if is a iax trunk
			else if( sessionData.pbxinfo.trunks.pri.hasOwnProperty(trunk) ){ x = sessionData.pbxinfo.trunks.pri; } // if is a iax trunk
			else if( sessionData.pbxinfo.trunks.providers.hasOwnProperty(trunk) ){ x = sessionData.pbxinfo.trunks.providers; } // if is a service Provider trunk
			if( x === null ){ return x; }
			for( var d in x ){ if( x.hasOwnProperty(d) ){ tr[d] = x[d] ; }}
			return tr;

		}catch(err){
			return null;
		}
	},

	addAnalogTrunk: function(tr, cbf){ // creates a new analog trunk with the details metioned in tr object, cbf is callback function
		// usage:: astgui_managetrunks.addAnalogTrunk({ 'zapchan':'2,3,4' , (optional) trunkname:'Ports 2,3,4'} , cbf) ;

		if(! tr.hasOwnProperty('zapchan') ){return false;} // zapchan is a required parameter. 

		var trunk = astgui_managetrunks.misc.nextAvailableTrunk_x();
		var group = astgui_managetrunks.misc.nextAvailableGroup();
		var ct = ASTGUI.contexts.TrunkDIDPrefix + trunk;
		// there are no incoming rules for analog trunks - there is only one catch all rule
		// we only add the fallback extension "exten=s,3,..."  in incoming rules  Ex: 'exten = s,3,Goto(default|6000|1)' 
		// any other patterns are not defined for Analag trunks
		var x = new listOfActions();
		x.filename('users.conf');
		x.new_action('delcat', trunk , '', ''); // not really needed - but just in case
		x.new_action('newcat', trunk, '', ''); // create new trunk
		// add some default values for any AnalogTrunk
			sessionData.pbxinfo.trunks.analog[trunk] = new ASTGUI.customObject; // add new/reset analog trunk info in sessionData
		x.new_action('append', trunk, 'group', group);
			sessionData.pbxinfo.trunks.analog[trunk]['group'] = group;
		x.new_action('append', trunk, 'hasexten', 'no');
			sessionData.pbxinfo.trunks.analog[trunk]['hasexten'] = 'no';
		x.new_action('append', trunk, 'hasiax', 'no');
			sessionData.pbxinfo.trunks.analog[trunk]['hasiax'] = 'no';
		x.new_action('append', trunk, 'hassip', 'no');
			sessionData.pbxinfo.trunks.analog[trunk]['hassip'] = 'no';
		x.new_action('append', trunk, 'trunkstyle', 'analog'.guiMetaData() );
			sessionData.pbxinfo.trunks.analog[trunk]['trunkstyle'] = 'analog';
		x.new_action('append', trunk, 'context', ct);
			sessionData.pbxinfo.trunks.analog[trunk]['context'] = ct;
		var zap_channels = ASTGUI.miscFunctions.chanStringToArray(tr.zapchan);
// 		var trunk_name = ( zap_channels.length > 1 ) ? 'Ports ' + tr.zapchan : 'Port ' + tr.zapchan ;
			sessionData.pbxinfo.trunks.analog[trunk]['zapchan'] = tr.zapchan ;
		delete tr.zapchan ;

		x.new_action('append', trunk, 'trunkname', tr.trunkname.guiMetaData() );
			sessionData.pbxinfo.trunks.analog[trunk]['trunkname'] = tr.trunkname;
			delete tr.trunkname;


		// these fields are already added, delete before iterating through userinfo
		if(! tr.hasOwnProperty('group') ){ delete tr.group ; }
		if(! tr.hasOwnProperty('signalling') ){ delete tr.signalling ; } // we will set the signalling based on zaptel.conf, so ignore what ever signalling is passed
		if(! tr.hasOwnProperty('hasiax') ){ delete tr.hasiax ; }
		if(! tr.hasOwnProperty('hassip') ){ delete tr.hassip ; }
		if(! tr.hasOwnProperty('trunkstyle') ){ delete tr.trunkstyle ; }
		for( var d in tr ){ if( tr.hasOwnProperty(d) ) {
			x.new_action( 'append', trunk , d, tr[d] );
				sessionData.pbxinfo.trunks.analog[trunk][d] = tr[d];
		}}

		// zap_channels
		zap_channels.each( function(channel){
			var temp_ls_List = ASTGUI.cloneObject( parent.sessionData.PORTS_SIGNALLING.ls ) ;
			var sg = ( temp_ls_List.contains(channel) ) ? 'fxs_ls':'fxs_ks' ;
			x.new_action('append', trunk, 'signalling', sg);
			x.new_action( 'append', trunk , 'zapchan', channel );
		} );

		var cb = function(){
			var v = new listOfSynActions('extensions.conf') ;
			v.new_action('delcat', ct, '', '');
			v.new_action('newcat', ct, '', ''); // add context
			v.new_action('delcat', ct + ASTGUI.contexts.TrunkDefaultSuffix , '', '');
			v.new_action('newcat', ct + ASTGUI.contexts.TrunkDefaultSuffix , '', ''); // add context
			v.new_action('append', ct , 'include', ct + ASTGUI.contexts.TrunkDefaultSuffix );

			v.new_action('append', 'globals', trunk , 'Zap/g' + group);

			var h = v.callActions();
			if( h.contains('Response: Success') ){
				cbf();
			}else{
				// looks like something failed
				// may be we should re-check users.conf and extensions.conf again and delete sessionData.pbxinfo.trunks.analog[trunk] if needed??
			}
		};

		x.callActions(cb); 
	},

	addIAXTrunk: function( tr , cbf ){  // 
		// usage:: astgui_managetrunks.addIAXTrunk( {'host':'iaxtel.com' , username:'my_username', secret:'my_secret', (required)fallback: '6001'  ....}, cbf ) ;
		if( !tr.hasOwnProperty('host')|| !tr.hasOwnProperty('username') || !tr.hasOwnProperty('secret') ){ return false; } //check for required parameters

		// add some default values for any IAXTrunk
//		var trunk = astgui_managetrunks.misc.nextAvailableTrunk_x();
		var trunk = tr.username ;
		sessionData.pbxinfo.trunks.iax[trunk] = new ASTGUI.customObject; // add new/reset iax trunk info in sessionData

		tr.hasiax = 'yes' ;
		tr.registeriax = 'yes';
		tr.hassip = 'no' ;
		tr.registersip = 'no';
		tr.trunkstyle ='voip';
		tr.hasexten = 'no';
		tr.disallow ='all';
		tr.allow = 'all';

		var ct = ASTGUI.contexts.TrunkDIDPrefix + trunk;
		var x = new listOfActions();

		x.filename('users.conf');
		x.new_action('delcat', trunk , '', ''); // not really needed - but just in case
		x.new_action('newcat', trunk, '', ''); // create new trunk

		x.new_action('append', trunk, 'context', ct);
			sessionData.pbxinfo.trunks.iax[trunk]['context'] = ct;

		for( var d in tr ){ if( tr.hasOwnProperty(d) ) {
			sessionData.pbxinfo.trunks.iax[trunk][d] = tr[d];
			if(d=='trunkname'){
				tr[d] = tr[d].guiMetaData() ;
			}
			x.new_action( 'append', trunk , d, tr[d] );
		}}

		var cb = function(){
			var v = new listOfSynActions('extensions.conf') ;
			v.new_action('delcat', ct, '', '');
			v.new_action('newcat', ct, '', ''); // add context
			v.new_action('delcat', ct + ASTGUI.contexts.TrunkDefaultSuffix , '', '');
			v.new_action('newcat', ct + ASTGUI.contexts.TrunkDefaultSuffix , '', ''); // add context
			v.new_action('append', ct , 'include', ct + ASTGUI.contexts.TrunkDefaultSuffix );

			v.new_action('update', 'globals', trunk, 'IAX2/' + trunk);
			var h = v.callActions();
			if( h.contains('Response: Success') ){
				cbf();
			}else{
				// looks like something failed
				// may be we should re-check users.conf and extensions.conf again and delete sessionData.pbxinfo.trunks.iax[trunk] if needed??
			}
		}
		x.callActions(cb); 
	},

	addSIPTrunk: function(tr,cbf){ // 
		// usage:: astgui_managetrunks.addSIPTrunk( {'host':'sip_test.digium.com' , username:'my_username', secret:'my_secret',(required)fallback: '6001' ....}, cbf ) ;
		if( !tr.hasOwnProperty('host')|| !tr.hasOwnProperty('username') || !tr.hasOwnProperty('secret') ){ return false; } //check for required parameters

		// add some default values for any SIPTrunk
		tr.hasiax = 'no' ; tr.registeriax = 'no';
		tr.hassip = 'yes' ; tr.registersip = 'yes';
		tr.trunkstyle ='voip';
		tr.hasexten = 'no';
		tr.disallow ='all';
		tr.allow = 'all';

		//var trunk = astgui_managetrunks.misc.nextAvailableTrunk_x();
		var trunk = tr.username ;
		var ct = ASTGUI.contexts.TrunkDIDPrefix + trunk;
		var x = new listOfActions();

		x.filename('users.conf');
		x.new_action('delcat', trunk , '', ''); // not really needed - but just in case
		x.new_action('newcat', trunk, '', ''); // create new trunk
			sessionData.pbxinfo.trunks.sip[trunk] = new ASTGUI.customObject; // add new/reset sip trunk info in sessionData
		x.new_action('append', trunk, 'context', ct);
			sessionData.pbxinfo.trunks.sip[trunk]['context'] = ct;

		for( var d in tr ){ if( tr.hasOwnProperty(d) ) {
			sessionData.pbxinfo.trunks.sip[trunk][d] = tr[d];
			if( d == 'trunkname' ){
				tr[d] = tr[d].guiMetaData() ;
			}
			x.new_action( 'append', trunk , d, tr[d] );
		}}

		var cb = function(){
			var v = new listOfSynActions('extensions.conf') ;
			v.new_action('delcat', ct, '', '');
			v.new_action('newcat', ct, '', ''); // add context

			v.new_action('delcat', ct + ASTGUI.contexts.TrunkDefaultSuffix , '', '');
			v.new_action('newcat', ct + ASTGUI.contexts.TrunkDefaultSuffix , '', ''); // add context
			v.new_action('append', ct , 'include', ct + ASTGUI.contexts.TrunkDefaultSuffix );

			v.new_action('update', 'globals', trunk, 'SIP/' + trunk);
			var h = v.callActions();

			if( h.contains('Response: Success') ){ 
				cbf();
			}else{ 
				// looks like something failed
				// may be we should re-check users.conf and extensions.conf again and delete sessionData.pbxinfo.trunks.sip[trunk] if needed??
			}
		}
		x.callActions(cb); 
	},

	misc:{ // object to store misc function used by other main functions in astgui_managetrunks
		nextAvailableTrunk_x: function(){ // Ex: return 'trunk_2' - if [trunk_1, trunk_3, trunk_5] currently exists
			//astgui_managetrunks.misc.nextAvailableTrunk_x()
			var x = [], y = astgui_managetrunks.listofAllTrunks(); 
			y.each( function( item ){
				if( item.beginsWith('trunk_') ){ x.push( item.split('trunk_')[1] ); }
			} );
			if( !x.length ){ return 'trunk_1' ; }
			return 'trunk_' + x.firstAvailable() ;
		},

		nextAvailableGroup: function() { // Ex: return '3' - if groups 1,2,4 are already defined in analog & pri trunks;
			//astgui_managetrunks.misc.nextAvailableGroup()
			var x = [], y = [];
			y = astgui_managetrunks.listOfAnalogTrunks();
			y.each( function( item ){
				x.push( sessionData.pbxinfo.trunks.analog[item]['group'] );
			} );

			y = astgui_managetrunks.listOfPRITrunks(); 
			y.each( function( item ){
				x.push( sessionData.pbxinfo.trunks.pri[item]['group'] );
			} );

			// we donot have to look in sip and iax trunks as they donot have a 'group' field
			return x.firstAvailable() ;
		},

		getTrunkType: function(TRUNK){ // astgui_managetrunks.misc.getTrunkType(TRUNK)
			if ( sessionData.pbxinfo.trunks.sip[TRUNK] ) { return 'sip' ; }
			if ( sessionData.pbxinfo.trunks.iax[TRUNK] ) { return 'iax' ; }
			if ( sessionData.pbxinfo.trunks.analog[TRUNK] ) { return 'analog' ; }
			if ( sessionData.pbxinfo.trunks.pri[TRUNK] ) { return 'pri' ; }
			if ( sessionData.pbxinfo.trunks.providers[TRUNK] ) { return 'providers' ; }
			return null;
		},

		getProviderTrunkType: function(TRUNK){ // astgui_managetrunks.misc.getProviderTrunkType(TRUNK)
			if (!sessionData.pbxinfo.trunks.providers.hasOwnProperty(TRUNK) ) { return '' ; }
			var T = sessionData.pbxinfo.trunks.providers[TRUNK] ;
			if( T.hasOwnProperty('hassip') && T['hassip'].isAstTrue() ){ return 'sip'; }
			if( T.hasOwnProperty('hasiax') && T['hasiax'].isAstTrue() ){ return 'iax'; }
			return '';
		},

		getTrunkName: function(TRUNK){ // astgui_managetrunks.misc.getTrunkName(TRUNK)
			var r = sessionData.pbxinfo.trunks;
			if ( r.sip[TRUNK] ) { return r.sip[TRUNK]['trunkname'] || TRUNK ; }
			if ( r.iax[TRUNK] ) { return r.iax[TRUNK]['trunkname'] || TRUNK ; }
			if ( r.analog[TRUNK] ) { return r.analog[TRUNK]['trunkname'] || TRUNK ; }
			if ( r.pri[TRUNK] ) { return r.pri[TRUNK]['trunkname'] || TRUNK ; }
			if ( r.providers[TRUNK] ) { return r.providers[TRUNK]['trunkname'] || TRUNK ; }
			return '';
		}
	}

};















astgui_manageCallingRules = {

	// ; Note that we expect only one calling rule in each 'CallingRule_XYZ' context
	// below are two contexts as expected in extensions.conf
	//
	// [CallingRule_911]
	//   exten = 911!,1,Macro( trunkdial-failover-0.3, ${trunk_1}/911, ${trunk_2}/911, trunk_1,trunk_2 )
	//
	// [CallingRule_1900]
	//   exten = 1900!,1,Hangup ; BLOCK 1900 calls
	//
	// [CallingRule_US]
	//    exten = _91NXXXXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:1}, ${trunk_2}/${EXTEN:1},trunk_1,trunk_2 )
	//	OR
	//    exten = _91NXXXXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/PREFIX_1${EXTEN:1}, ${trunk_2}/PREFIX_2${EXTEN:0}, trunk_1, trunk_2 )
	//                                                                      ^^^^^^^^       ^^             ^^^^^^^^^       ^^
	// [CallingRule_Local]
	//    exten = _256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:0}, ${trunk_2}/${EXTEN:0},trunk_1,trunk_2 )
	//    exten = _1256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:1}, ${trunk_2}/${EXTEN:1},trunk_1,trunk_2 )
	//    exten = _91256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:2}, ${trunk_2}/${EXTEN:2},trunk_1,trunk_2 )
	//
	/* sample structure for a callingRules object in javascript
		sessionData.pbxinfo.callingRules : {
			CallingRule_911 : [ 'exten = 911!,1,Macro( trunkdial-failover-0.3, ${trunk_1}/911, ${trunk_2}/911, trunk_1,trunk_2 )' ],
			CallingRule_1900 : [ 'exten = 1900!,1,Hangup ; BLOCK 1900 calls' ],
			CallingRule_Local : [ 
				'exten = _256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:0}, ${trunk_2}/${EXTEN:0},trunk_1,trunk_2 )',
				'exten = _1256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:1}, ${trunk_2}/${EXTEN:1},trunk_1,trunk_2 )',
				'exten = _91256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:2}, ${trunk_2}/${EXTEN:2},trunk_1,trunk_2 )'
			]
		}
	*/

	createCallingRule: function(crname, crstring){ // usage :: astgui_manageCallingRules.createCallingRule(name, crstring)
		if(! crname.beginsWith(ASTGUI.contexts.CallingRulePrefix) ){
			crname = ASTGUI.contexts.CallingRulePrefix + crname ;
		}
		if( crstring.beginsWith('exten=') ){
			crstring = crstring.lChop('exten=');
		}
		var u = new listOfSynActions('extensions.conf') ;
		if( !sessionData.pbxinfo.callingRules.hasOwnProperty(crname) ){
			u.new_action('newcat', crname , '', '');
			sessionData.pbxinfo.callingRules[crname] = [] ;
		}
		u.new_action( 'append', crname , 'exten', crstring );
		u.callActions();
		sessionData.pbxinfo.callingRules[crname].push( 'exten=' + crstring );
		return true;
	},

	updateCallingRule: function( crname, oldString, newString ){ // astgui_manageCallingRules.createCallingRule( crname, oldString, newString  )
		var u = new listOfSynActions('extensions.conf') ;
		u.new_action('update', crname, 'exten', newString.lChop('exten=') , oldString.lChop('exten=') );
		u.callActions();
		sessionData.pbxinfo.callingRules[crname] = ASTGUI.cloneObject(sessionData.pbxinfo.callingRules[crname]).replaceAB(oldString, newString);
	},

	deleteCallingRule: function( crname, crstring ){
		if( crstring.beginsWith('exten=') ){
			crstring = crstring.lChop('exten=');
		}

		var u = new listOfSynActions('extensions.conf') ;

		if( ( sessionData.pbxinfo.callingRules[crname].length == 1 ) && (sessionData.pbxinfo.callingRules[crname][0] == 'exten=' + crstring ) ){
			u.new_action('delcat', crname , '', '');
			delete sessionData.pbxinfo.callingRules[crname] ;
		}else{
			u.new_action('delete', crname, 'exten', '', crstring );
			sessionData.pbxinfo.callingRules[crname] = ASTGUI.cloneObject(sessionData.pbxinfo.callingRules[crname]).withOut( 'exten=' + crstring ) ;
		}

		u.callActions();
		return true;
	}
};















astgui_manageCallPlans = { // manage calling plans/Dialplans
	// [CLPN_USA]
	//   include = CallingRule_US
	//   include = CallingRule_911

	/* sample structure for a callingplan object
	sessionData.pbxinfo.callingPlans : { 
		CLPN_USA : {
			includes : ['default', 'CallingRule_local', 'CallingRule_911', 'parkedcalls' ]  //contexts included in this dialplan
		}
	}
	*/
	parseContext: function(cxt){ // parse a callPlan context
		// takes an array as input ( an extensions.conf context read with usf:0 ) and returns a object (callPlan data structure)
		var dp = { includes: [] };
		cxt.each( function(line) {
			if( line.beginsWith('include=') ){ dp.includes.push( line.afterChar('=') ); return true; }
		});
		return dp;
	},

	listPlans: function(){ // astgui_manageCallPlans.listPlans();
		var list = [];
		try{
			for(var x in sessionData.pbxinfo.callingPlans ){ if( sessionData.pbxinfo.callingPlans.hasOwnProperty(x)){	
				list.push(x);
			}}
		}catch(err){
			return [];
		}
		return list;
	},

	addPlan: function( dp_name, dp , cbf ) {
	//	astgui_manageCallPlans.addPlan('CLPN_USA', { includes : ['default','parkedcalls'] }, callback_function );
		if( !dp_name.beginsWith(ASTGUI.contexts.CallingPlanPrefix) ){
			dp_name = ASTGUI.contexts.CallingPlanPrefix + dp_name;
		}
		var x = new listOfActions();
		x.filename('extensions.conf');
		x.new_action('delcat', dp_name, '', ''); 
		x.new_action('newcat', dp_name , '', ''); // create new callplan
		dp.includes.each( function(include_context) {
			x.new_action( 'append', dp_name , 'include' , include_context );
		});
		var on_success = function(){
			sessionData.pbxinfo.callingPlans[ dp_name ] = dp ; // that was simple :)
			cbf(); // execute callback
		};
		x.callActions(on_success);
	},

	deletePlan: function(dp){ // ex: astgui_manageCallPlans.deletePlan('CLPN_USA');
		var u = new listOfSynActions('extensions.conf') ;
		u.new_action('delcat', dp, '', '') ; 
		var g = u.callActions();
		if ( g.contains('Response: Success') ){
			try{
				if( sessionData.pbxinfo.callingPlans[dp] ) { // remove the dialplan from the pbxinfo
					delete sessionData.pbxinfo.callingPlans[dp] ;
				}
			}catch(err){}
			return true;
		}else{
			return false;
		}
	},

	dropCallingRule: function( callPlan, callingRule) { //astgui_manageCallPlans.dropCallingRule ('CLPN_USA', 'CallingRule_local')
		var u = new listOfSynActions('extensions.conf') ;
		u.new_action('delete', callPlan, 'include', '', callingRule ) ;
		var g = u.callActions();
		if ( g.contains('Response: Success') ){
			try{
				if( sessionData.pbxinfo.callingPlans[callPlan].includes ) {
					var t = sessionData.pbxinfo.callingPlans[callPlan].includes.withOut( callingRule ) ;
					sessionData.pbxinfo.callingPlans[callPlan].includes = t ;
				}
			}catch(err){}
			return true;
		}else{
			return false;
		}
	},

	includeCallingRule: function( callPlan, callingRule) { //astgui_manageCallPlans.includeCallingRule('CLPN_USA', 'CallingRule_local')
		var u = new listOfSynActions('extensions.conf') ;
		u.new_action('append', callPlan, 'include', callingRule ) ;
		var g = u.callActions();
		if ( g.contains('Response: Success') ){
			try{
				if( sessionData.pbxinfo.callingPlans[callPlan].includes ) {
					sessionData.pbxinfo.callingPlans[callPlan].includes.push( callingRule ) ;
				}
			}catch(err){}
			return true;
		}else{
			return false;
		}
	},

	nextAvailableDP: function( ){ // astgui_manageCallPlans.nextAvailableDP();
		var t = [];
		var s = ASTGUI.contexts.CallingPlanPrefix + 'DialPlan' ;
		var c = parent.astgui_manageCallPlans.listPlans() ;
		c.each( function(plan){
			if( plan.beginsWith(s) ){
				var d = Number( plan.lChop(s) ) ;
				if( isNaN(d) ){
				
				}else{
					t.push(d);
				}
			}
		});
		return 'DialPlan' + t.firstAvailable(1) ;
	}
};

















astgui_manageVoiceMenus = {
	/* sample structure for a voicemenu object 

	[voicemenus]
		exten = 6070,1,Goto(voicemenu-custom-1|s|1) // extension for voicemenus are defined here
	[voicemenu-custom-1]
		exten = s,1,NoOp(Welcome VoiceMenu)
		exten = s,2,Answer
		exten = s,3,Wait(1)
		exten = s,4,Background(thank-you-for-calling)
		exten = 2,1,Goto(default|6000|1) // keypress Action
		include = default

	is parsed as 
	vm = {
		comment : 'Welcome VoiceMenu', 	// label given to this voicemenu (gui-only field )
		alias_exten : '6070,1,Goto(voicemenu-custom-1|s|1)' ,   // if this voicemenu is given a local extension
		includes : ['default'] , // contexts included in this voicemenu
		steps : [ 'NoOp(Welcome VoiceMenu)', 'Answer',  'Wait(1)',  'Background(thank-you-for-calling)' ]  , // sequence of steps - the 's' extension
		keypressEvents : {
			// key press events - assumption is that each key press action is defined in a single line, all priorities greater than 1 are ignored
			// if you want a sequence of steps to be executed on a keypress, build another menu with all the steps & point the key to that menu
			2 : 'Goto(default|6000|1)'
		}
	};
	*/

	parseContext: function(cxt){ // takes array 'cxt' as input, parses cxt array and returns a Object (standard VoiceMenu structure)
		var vm = {
			comment:'',
			alias_exten:'',
			includes:[],
			steps:[],
			keypressEvents: { 0:'', 1:'', 2:'', 3:'', 4:'', 5:'', 6:'', 7:'', 8:'', 9:'', '#':'' , '*':'', t:'', i: ''}
		};
		var TMP_STEPS = ASTGUI.sortContextByExten(cxt, true);
		TMP_STEPS['s'].forEach( function(step){
			return ASTGUI.parseContextLine.getAppWithArgs(step);
		});
		vm.steps = TMP_STEPS['s'];
		vm.comment = vm.steps[0].getNoOp();
		['0','1','2','3','4','5','6','7','8','9','*','#','t','i'].each( function(this_key){
			if( TMP_STEPS.hasOwnProperty(this_key) && TMP_STEPS[this_key].length==1 ){
				vm.keypressEvents[this_key] = ASTGUI.parseContextLine.getAppWithArgs(TMP_STEPS[this_key][0]) ;
			}
		});

		cxt.each( function(line , cxt_index) {
			if( line.beginsWith('include=') ){
				vm.includes.push( line.afterChar('=') );
				return true;
			}
		});

		return ASTGUI.toCustomObject(vm);
	},

	addMenu: function(new_name, new_menu, cbf){ // Creates a New Voicemenu 'new_name' with a standard VoiceMenu structure of 'new_menu'
		var x = new listOfActions();
		x.filename('extensions.conf');
		x.new_action('delcat', new_name , '', ''); // not really needed - but just in case
		x.new_action('newcat', new_name , '', ''); // create new VoiceMenu
		new_menu.includes.each( function(item) { // usually ['default'] or just [] 
			x.new_action( 'append', new_name , 'include', item );
		});
		if( new_menu.alias_exten ){ // add 'exten = 7000,1,Goto(voicemenu-custom-1|s|1)' in  context 'voicemenus'
			if( !new_menu.alias_exten.contains(',') || !new_menu.alias_exten.toLowerCase().contains('goto(') ){// if new_menu.alias_exten is '4444'
				new_menu.alias_exten = new_menu.alias_exten.lChop('exten=') + ',1,Goto(' + new_name + '|s|1)' ;
			}
			x.new_action( 'append', ASTGUI.contexts.VoiceMenuExtensions , 'exten', new_menu.alias_exten );
		}
		new_menu.steps.each( function(step, i) { // note that first step should be NoOp(Comment)
			if( !step.beginsWith('s,') ){
				step = 's,' + (i+1) + ',' + step ;
			}
			x.new_action( 'append', new_name , 'exten', step );
		});
		for( var y in new_menu.keypressEvents){
			if(!new_menu.keypressEvents.hasOwnProperty(y) || new_menu.keypressEvents[y] == '' ){
				continue;
			}
			var kext = y + ',1,' + new_menu.keypressEvents[y] ;
			x.new_action( 'append', new_name , 'exten', kext );
		}
		var cb = function(){
			sessionData.pbxinfo.voicemenus[new_name] = ASTGUI.toCustomObject(new_menu) ; // update VoiceMenu info in sessionData :)
			cbf();
		};
		x.callActions(cb) ;
	},

	deleteMenu: function(menu_name){ // deletes voicemenu 'menu_name'
		var v = new listOfSynActions('extensions.conf') ;
		v.new_action('delcat', menu_name, '', ''); 
		if( sessionData.pbxinfo.voicemenus[menu_name]['alias_exten'] != '' ){
			var aext = sessionData.pbxinfo.voicemenus[menu_name]['alias_exten'] ;
			v.new_action('delete', ASTGUI.contexts.VoiceMenuExtensions , 'exten', '', aext);
			v.new_action('delete', 'default' , 'exten', '', aext); // backward compatibility with gui 1.x
		}
		var g = v.callActions();
		if( sessionData.pbxinfo.voicemenus.hasOwnProperty(menu_name) ) delete sessionData.pbxinfo.voicemenus[menu_name] ;
		return true;
	},

	nextAvailableVM_x : function(){ // astgui_manageVoiceMenus.nextAvailableVM_x();
		var x = [], y = sessionData.pbxinfo.voicemenus.getOwnProperties();
		y.each( function( item ){
			if( item.beginsWith(ASTGUI.contexts.VoiceMenuPrefix) ){ x.push( item.split(ASTGUI.contexts.VoiceMenuPrefix)[1] ); }
		} );
		if( !x.length ){ return ASTGUI.contexts.VoiceMenuPrefix + '1' ; }
		return ASTGUI.contexts.VoiceMenuPrefix + x.firstAvailable() ;
	}
};






astgui_manageConferences = {
	/* 
	The GUI creates/expects conference rooms in the following format	
		extensions.conf
			[ASTGUI.contexts.CONFERENCES]
			exten => 6001,1,MeetMe(${EXTEN}|MsIwAq)
			exten => 6002,1,MeetMe(6001|MsIwAq) // 6001's extension for admin/marked users
		meetme.conf 
			[rooms]
			conf = 6001,4567,7654 
		//6001 is the conference number, 4567 is the password to join, 7654 is the adminpwd

	the above conference room is stored in the data structure as
		sessionData.pbxinfo.conferences['6001'] = { configOptions : '6001,1,MeetMe(${EXTEN}|MsIwAq)' , pwdString : '6001,4567,7654' }
	*/

	loadMeetMeRooms: function(){
		// parses the context rooms [ASTGUI.contexts.CONFERENCES] in extensions.conf 
		var cxt = context2json({ filename:'extensions.conf' , context : ASTGUI.contexts.CONFERENCES , usf:0 }) ;
		if( cxt === null ){ // context not found
				var w = new listOfSynActions('extensions.conf') ;
				w.new_action('newcat', ASTGUI.contexts.CONFERENCES , '', '') ;
				w.callActions();
				cxt = [];
		}
		cxt.each(function(line){ // line is in the format 'conf=6001,4567,7654'
			if(!line.beginsWith('exten=') ){ return;}
			var b = ASTGUI.parseContextLine.getExten(line) ;
			var configOptions = line.afterChar('=');
			var params = configOptions.betweenXY('|',')');
			if( params.contains('a') &&  params.contains('A') ) { // if is a meetMe Admin Login
				b = configOptions.betweenXY('(','|');
			}
			if( !sessionData.pbxinfo.conferences.hasOwnProperty(b) ){
				sessionData.pbxinfo.conferences[b] = new ASTGUI.customObject ;
				sessionData.pbxinfo.conferences[b]['configOptions'] = '' ;
				sessionData.pbxinfo.conferences[b]['adminOptions'] = '' ;
				sessionData.pbxinfo.conferences[b]['pwdString'] = '' ;
			}
			if( params.contains('a') &&  params.contains('A') ) { // if is a meetMe Admin Login
				sessionData.pbxinfo.conferences[b]['adminOptions'] = configOptions;
			}else{
				sessionData.pbxinfo.conferences[b]['configOptions'] = configOptions;
			}
		});

		var pwds = context2json({ filename:'meetme.conf' , context : 'rooms' , usf:0 }) ;
		if(pwds === null ){ // context not found
				var w = new listOfSynActions('meetme.conf') ;
				w.new_action('newcat', 'rooms', '', '') ;
				w.callActions();
				pwds = [];
		}
		pwds.each(function(line){
			if(!line.beginsWith('conf=') ){ return;}
			var b = line.betweenXY('=',',') ;
				b = b.trim();
			if( !sessionData.pbxinfo.conferences.hasOwnProperty(b) ){
				sessionData.pbxinfo.conferences[b] = new ASTGUI.customObject ;
				sessionData.pbxinfo.conferences[b]['configOptions'] = '';
			}
			sessionData.pbxinfo.conferences[b]['pwdString'] = line.afterChar('=');
		});
	},

	getList: function(){ // astgui_manageConferences.getList(); returns an array with the list of conference room extensions
		if( !sessionData.pbxinfo.hasOwnProperty('conferences') ){return [];}
		var y = [];
		for( var x in sessionData.pbxinfo.conferences ){ if( sessionData.pbxinfo.conferences.hasOwnProperty(x) ){ y.push(x); } }
		return y;
	}

};





astgui_manageQueues = {
/* QueueDefinition
	extensions.conf
		[ASTGUI.contexts.QUEUES]
		exten = 6000,1,Queue(${EXTEN}) 
	queues.conf
		[6000]
		fullname = QueueName 
		strategy = roundrobin
		timeout = 100
		wrapuptime = 100
		autofill = yes
		autopause = yes
		maxlen = 100
		joinempty = yes
		leavewhenempty = yes
		reportholdtime = yes
		musicclass = default
		member = Agent/6001
		member = Agent/6002

and the data structure is 
	sessionData.pbxinfo.queues[6000] = {
		configLine: '6000,1,Queue(${EXTEN})'
	}
*/
	loadQueues: function(){ //sessionData.pbxinfo.queues[queue_exten]
		var cxt = context2json({ filename:'extensions.conf' , context : ASTGUI.contexts.QUEUES , usf:0 }) ;
		if( cxt === null ){ // context not found
				var w = new listOfSynActions('extensions.conf') ;
				w.new_action('newcat', ASTGUI.contexts.QUEUES , '', '') ;
				w.callActions();
				cxt = [];
		}
		cxt.each(function(line){ // line is in the format 'exten=6000,1,Queue(${EXTEN})'
			if(!line.beginsWith('exten=') ){ return;}
			var b = ASTGUI.parseContextLine.getExten(line) ;
			var configLine = line.afterChar('=');
			if( !sessionData.pbxinfo.queues.hasOwnProperty(b) ){
				sessionData.pbxinfo.queues[b] = new ASTGUI.customObject;
			}
			sessionData.pbxinfo.queues[b]['configLine'] = configLine;
		});
	}
};





astgui_manageRingGroups = {
/*
	[ringgroups] ; <-- ASTGUI.contexts.RingGroupExtensions in astman.js
	exten = 2345,1,Goto(ringroups-custom-X|s|1)

	[ringroups-custom-X]
	exten = s,1,NoOp(RINGGROUPNAME) ; <-- gui expects the ringgroup name , if not found name will be 'ringgroup X'
	exten = s,n,Dial(Zap/1,30,i)
	exten = s,n,Dial(Zap/4,30,i)
	exten = s,n,Dial(IAX2/6000,30,i)
	exten = s,n,Hangup

	sessionData.pbxinfo['ringgroups']['ringroups-custom-X'] = {
		NAME : RINGGROUPNAME,
		strategy : 'ringinorder',
		members : ['Zap/1','Zap/4', 'IAX2/6000']
		extension : '2345' ,
		ringtime : '30',
		fallback : 'Hangup'
	}

*/
	parseContext: function(cxtname, cxt, rgextns){ // parses array cxt and updates "sessionData.pbxinfo.ringgroups[cxtname]"
		var rg = new ASTGUI.customObject;
			rg.NAME = '';
			rg.members = [];
			rg.strategy = '';

		if( cxt[0].contains('exten=s,1') &&  cxt[0].toLowerCase().contains('noop(')  ){
			rg.NAME = cxt[0].betweenXY( '(' , ')' );
			cxt.splice(0,1);
		}else{
			rg.NAME = 'RingGroup ' + cxtname.withOut(ASTGUI.contexts.RingGroupPrefix);
		}

		var dialcount = 0;
		cxt.each( function(line) {
			if( line.beginsWith('gui_ring_groupname=') ){ // old gui ring group name
				rg.NAME = line.afterChar('=');
				return;
			}
			if( line.toLowerCase().contains('dial(') ){
				dialcount++;
				var args = ASTGUI.parseContextLine.getArgs( line );
				if ( args[0].contains('&') ){
					rg.members = rg.members.concat( args[0].split('&') );
				}else{
					rg.members.push( args[0] );
				}
				rg.ringtime = ( args[1] );
			}
		});

		rg.strategy = (dialcount > 1) ? 'ringinorder':'ringall' ;
		var lastline = cxt[cxt.length -1].toLowerCase();
		if(! lastline.contains('dial(') && lastline.beginsWith('exten=s,n') ){
			rg.fallback = lastline.split('=s,n,')[1] ;
		}

		for(var u=0, v = rgextns.length; u < v ; u++ ){
			if( rgextns[u].contains(cxtname + '|') ){
				rg.extension = ASTGUI.parseContextLine.getExten(rgextns[u]);
				break;
			}
		}

		return rg;
	},

	getRGsList: function(){ // astgui_manageRingGroups.getRGsList();
		var rgl = [] ;
		var c = sessionData.pbxinfo.ringgroups;
		for(var d in c){
			if(c.hasOwnProperty(d)){
				rgl.push(d);
			}
		}
		return rgl ;
	},

	nextAvailableRG_x : function(){ // astgui_manageRingGroups.nextAvailableRG_x();
		var x = [], y = this.getRGsList() ;
		y.each( function( item ){
			if( item.beginsWith(ASTGUI.contexts.RingGroupPrefix) ){ x.push( item.split(ASTGUI.contexts.RingGroupPrefix)[1] ); }
		} );
		if( !x.length ){ return ASTGUI.contexts.RingGroupPrefix + '1' ; }
		return ASTGUI.contexts.RingGroupPrefix + x.firstAvailable() ;
	},

	createNewRg: function( rg , callback , newName ){
		// astgui_manageRingGroups.createNewRg(rg , callback , newName );
		// rg is a standard ring group object , callback is callback function, newName(optional) to create with a specific contextname
		var newrg = newName || this.nextAvailableRG_x() ;
		if( !rg.fallback ){
			rg.fallback = 'Hangup'
		}
		var x = new listOfActions();
		x.filename('extensions.conf');
		x.new_action('newcat', newrg , '', '');
		x.new_action('append', newrg, 'exten', 's,1,NoOp(' + rg.NAME  + ')' );
		if( rg.strategy == 'ringinorder' ){
			rg.members.each(
				function(member){
					x.new_action('append', newrg, 'exten', 's,n,Dial(' + member +',' + rg.ringtime + ',i)' );
				}
			);
		}else{
			if(rg.members.length){
				x.new_action('append', newrg, 'exten', 's,n,Dial(' + rg.members.join('&') +',' + rg.ringtime + ',i)' );
			}
		}
		x.new_action( 'append', newrg, 'exten', 's,n,' + rg.fallback );
		var after = function() {
			if( rg.extension ){
				var u = new listOfSynActions('extensions.conf') ;
				u.new_action( 'append', ASTGUI.contexts.RingGroupExtensions , 'exten',  rg.extension + ',1,Goto(' + newrg + '|s|1)' );
				u.callActions();
			}
			sessionData.pbxinfo.ringgroups[newrg] = rg ;
			callback();
		};
		x.callActions( after );
	},

	deleteRg : function(rgname){
		// astgui_manageRingGroups.deleteRg(rgname)
		// rgname is the actual ringgroup context name - like 'ASTGUI.contexts.RingGroupPrefix + 1'
		var u = new listOfSynActions('extensions.conf') ;
		u.new_action('delcat', rgname , '', '');
		if( sessionData.pbxinfo.ringgroups[rgname].extension ){



			var f = sessionData.pbxinfo.ringgroups[rgname].extension ;


			u.new_action( 'delete', ASTGUI.contexts.RingGroupExtensions , 'exten', '', f + ',1,Goto(' + rgname + '|s|1)' ) ;
			if( sessionData.pbxinfo.ringgroups[rgname].hasOwnProperty('isOLDRG') && sessionData.pbxinfo.ringgroups[rgname].isOLDRG == true ){
				u.new_action( 'delete', 'default' , 'exten', '', f + ',1,Goto(' + rgname + '|s|1)' ) ;
			}
		}

		u.callActions();
		delete sessionData.pbxinfo.ringgroups[rgname] ;
	}
};


astgui_manageVMgroups = {
	/*
		[ASTGUI.contexts.VoiceMailGroups]
		exten = 6600,1, NoOp(Sales_VoiceMailGroup)
		exten = 6600,2, VoiceMail(6001@default&6003@default&6010@default)
		
			is stored as 

		sessionData.pbxinfo['vmgroups'][6600] = {
			label : 'Sales_VoiceMailGroup',
			mailboxes : ['6001','6003','6010']
		}
	*/
	addVMGroup: function( vmg_exten, vmg ){ 
		// add voicemail group - astgui_manageVMgroups.addVMGroup('6600', {label:'Sales_VoiceMailGroup', mailboxes:['6001','6003','6010']});
		var line_1 = vmg_exten + ',1,NoOp(' + vmg.label + ')' ;
		var line_2 = vmg_exten + ',2,VoiceMail(' + vmg.mailboxes.join('@default&') + '@default' + ')' ;

		var x = new listOfSynActions('extensions.conf');
		x.new_action( 'append', ASTGUI.contexts.VoiceMailGroups , 'exten', line_1);
		x.new_action( 'append', ASTGUI.contexts.VoiceMailGroups , 'exten', line_2);
		x.callActions();

		sessionData.pbxinfo['vmgroups'][vmg_exten] = vmg ;
	},

	parseContext: function(vmg_context){ // parse voicemail groups -- astgui_manageVMgroups.parseContext(cxt);
		try{
			var new_vm_group = function(){
				var a = new ASTGUI.customObject ; a.label = '' ; a.mailboxes = [] ;
				return a ;
			};
			vmg_context.each( function(line){
				if( line.toLowerCase().contains('noop(')  ){
					var tmp_vmgroupname = line.getNoOp();
					var tmp_vmgroup_exten = ASTGUI.parseContextLine.getExten( line );
					if ( !sessionData.pbxinfo.vmgroups.hasOwnProperty(tmp_vmgroup_exten) ){
						sessionData.pbxinfo.vmgroups[tmp_vmgroup_exten] = new_vm_group();
					}
					sessionData.pbxinfo.vmgroups[tmp_vmgroup_exten]['label'] = tmp_vmgroupname ;
				}
				if( line.toLowerCase().contains('voicemail(')  ){
					var tmp_vmgroup_exten = ASTGUI.parseContextLine.getExten( line );
					if ( !sessionData.pbxinfo.vmgroups.hasOwnProperty(tmp_vmgroup_exten) ){
						sessionData.pbxinfo.vmgroups[tmp_vmgroup_exten] = new_vm_group();
					}
					var tmp_vmmembers_String = ASTGUI.parseContextLine.getArgs(line)[0];
					tmp_vmmembers_String.split('&').each(
						function( this_memberstring ){
							this_memberstring = this_memberstring.trim();
							if( this_memberstring ){
								sessionData.pbxinfo.vmgroups[tmp_vmgroup_exten]['mailboxes'].push( this_memberstring.beforeChar('@').trim() );
							}
						}
					);
				}
			});
		}catch(err){ }
	},

	deleteVMGroup: function(vmg_exten){ // delete voicemail group -- astgui_manageVMgroups.deleteVMGroup('6050');
		ASTGUI.miscFunctions.delete_LinesLike(
			{
				context_name : ASTGUI.contexts.VoiceMailGroups,
				beginsWithArr:  [ 'exten=' + vmg_exten + ','   ,  'exten=' + vmg_exten + ' ,' ],
				filename: 'extensions.conf',
				cb: function(){}
			}
		);

		delete sessionData.pbxinfo.vmgroups[vmg_exten] ;
	}
	// get_ListOfVMGroup_Extensions: function(){
	// 	return sessionData.pbxinfo.vmgroups.getOwnProperties();
	// }
};



astgui_manageTimeBasedRules = {
	/*
	// TimeBasedRule Type - by Day of Week
		[timebasedrule-custom-1] // 'timebasedrule-custom-' is time based rule prefix
		exten = s,1,NoOp(LabelForThisRule)
		exten = s,n,GotoIfTime(00:00-23:59|sun-sat|*|*?voicemenu-custom-1,s,1)
			OR
		exten = s,n,GotoIfTime(*|sun-sat|*|*?voicemenu-custom-1,s,1)
		exten = s,n,Goto(default,6000,1)

	// TimeBasedRule Type - by a set of Dates
		[timebasedrule-custom-2] 
		exten = s,1,NoOp(LabelForThisRule)
		exten = s,n,GotoIfTime( 00:00-23:59|*|25|dec?voicemenu-custom-1,s,1 ) // christmas
		exten = s,n,GotoIfTime( 00:00-23:59|*|1|jan?voicemenu-custom-1,s,1 ) // Jan 1st
		exten = s,n,GotoIfTime( 00:00-23:59|*|4|jul?voicemenu-custom-1,s,1 ) // July 4rth
			OR
		exten = s,n,GotoIfTime( *|*|4|jul?voicemenu-custom-1,s,1 ) // July 4rth
		exten = s,n,Goto(default,6000,1)

	
		// data structure //
		sessionData.pbxinfo['timebasedRules'][timebasedrule-custom-2] = {
			label : 'LabelForThisRule',
			matches : [ '00:00-23:59|*|25|dec', '00:00-23:59|*|1|jan', '00:00-23:59|*|4|jul' ], // by a set of Dates
				OR
			matches : [ '00:00-23:59|sun-sat|*|*'], // - by Day of Week, matches.length == 1
			ifMatched : 'voicemenu-custom-1,s,1',
			ifNotMatched : 'default,6000,1'
		}
	*/

	parseContext : function(cxtname, cxt) { // parses a timebased rules context and returns a standard time based rules object 
		// sessionData.pbxinfo['timebasedRules'][d]
		var tbr = { label : '', matches : [] , ifMatched : '', ifNotMatched : '' } ;

		if( cxt[0].contains('exten=s,1') &&  cxt[0].toLowerCase().contains('noop(')  ){
			tbr.label = cxt[0].betweenXY( '(' , ')' );
			cxt.splice(0,1);
		}else{
			tbr.label = 'TimeBased Rule ' + cxtname.withOut(ASTGUI.contexts.TimeBasedRulePrefix);
		}

		cxt.each( function(line) {
			if( line.toLowerCase().contains('s,n,gotoiftime(') ){
				tbr.matches.push( line.betweenXY('(','?') );
				tbr.ifMatched = line.betweenXY('?',')') ;
				return;
			}
			if( line.toLowerCase().contains('s,n,') ) {
				tbr.ifNotMatched = line.afterStr( 's,n,' ) ;
			}
		});

		return tbr ;
	},

	getTBRsList : function(){ // astgui_manageTimeBasedRules.getTBRsList
		var tbrl = [] ;
		var c = sessionData.pbxinfo['timebasedRules'];
		for(var d in c){if(c.hasOwnProperty(d)){
			tbrl.push(d);
		}}
		return tbrl;
	},

	nextAvailableTBR_x: function(){ // astgui_manageTimeBasedRules.nextAvailableTBR_x
		var x = [], y = astgui_manageTimeBasedRules.getTBRsList() ;
		y.each( function( item ){
			if( item.beginsWith(ASTGUI.contexts.TimeBasedRulePrefix) ){ x.push( item.split(ASTGUI.contexts.TimeBasedRulePrefix)[1] ); }
		} );
		if( !x.length ){ return ASTGUI.contexts.TimeBasedRulePrefix + '1' ; }
		return ASTGUI.contexts.TimeBasedRulePrefix + x.firstAvailable() ;
	},
	
	createNewTBR: function( tbr , callback, newtb_ctname ){ // astgui_manageTimeBasedRules.createNewTBR(tbr, cb, name(optional) )
		// tbr is new timebased rule object, callback is callback function, newtb_ctname(Optional) if you want to create with a specific name
		// 
		var newtb_cxt = newtb_ctname || this.nextAvailableTBR_x();
		var x = new listOfActions();
		x.filename('extensions.conf');
		x.new_action('newcat', newtb_cxt , '', '');
		x.new_action('append', newtb_cxt , 'exten', 's,1,NoOp(' + tbr.label  + ')' );
		tbr.matches.each(function(match_time){
			x.new_action('append', newtb_cxt , 'exten', 's,n,GotoIfTime(' + match_time + '?' + tbr.ifMatched +')' );
		});
		x.new_action('append', newtb_cxt , 'exten', 's,n,' +  tbr.ifNotMatched );
		var after = function(){
			sessionData.pbxinfo.timebasedRules[newtb_cxt] = tbr ;
			callback();
		};
		x.callActions(after);
	},
	
	deleteTBR : function(tbname){ // astgui_manageTimeBasedRules.deleteTBR(tbrname); 
		var u = new listOfSynActions('extensions.conf') ;
		u.new_action('delcat', tbname , '', '');
		u.callActions();
		delete sessionData.pbxinfo.timebasedRules[tbname] ;
	}

};


