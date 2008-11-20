/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * Welcome.html functions to gather system status
 *
 * Copyright (C) 2006-2008, Digium, Inc.
 *
 * Pari Nannapaneni <pari@digium.com>
 * Ryan Brindley <ryan@digium.com>
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

var REGISTRY_OUTPUT = { } ;
var EX_CF;
var tmp_image = document.createElement('IMG');
$(tmp_image).attr('border', '0');

var managerEvents = {};
var manager_timers = {};

 managerEvents.agentLogoutLink = function(agent){
	var tmp_qlogout = document.createElement('div');
	tmp_qlogout.innerHTML = '<u>Logout</u>';
	$(tmp_qlogout).css({ cursor : 'pointer', 'font-size': '80%', color: '#ADADAD' });
	ASTGUI.events.add( tmp_qlogout, 'click' , function(){
		$.ajax({ type: 'GET', url: ASTGUI.paths.rawman, data: 'action=AgentLogoff&Agent='+ agent +'&Soft=true', success: function(){} });
	});
	return tmp_qlogout;
};


 managerEvents.agentLoginLink = function(agent){ // 
	var tmp_qlogout = document.createElement('div');
	tmp_qlogout.innerHTML = '<u>Login</u>';
	$(tmp_qlogout).css({ cursor : 'pointer', 'font-size': '80%', color: '#5a7dd6' });
	ASTGUI.events.add( tmp_qlogout, 'click' , function(){
		$.ajax({ type: 'GET', url: ASTGUI.paths.rawman, data: 'action=AgentCallbackLogin&Agent='+ agent +'&Exten='+ agent, success: function(){} });
	});
	return tmp_qlogout;
};

managerEvents.updateAllUsersStatus = function(){
	var ul = parent.astgui_manageusers.listOfUsers();
	ul.each(function(user){
		var new_status = ASTGUI.getUser_DeviceStatus(user) ;
		managerEvents.updateUserImage(user, new_status);
	});
};

managerEvents.updateUserImage = function(user , user_status){
	var this_td = _$('TD_USER_DEVICE_STATUS_' + user );
	ASTGUI.domActions.removeAllChilds ( this_td );
	switch(user_status){
		case 'F': // No Device is Busy/InUse
			var IMG_STATUS_GREEN = tmp_image.cloneNode(true);
			this_td.appendChild(IMG_STATUS_GREEN) ;
			$(IMG_STATUS_GREEN).attr( 'src', 'images/status_green.png' );
			break ;
		case 'B': // Busy
			var IMG_STATUS_RED = tmp_image.cloneNode(true);
			this_td.appendChild(IMG_STATUS_RED) ;
			$(IMG_STATUS_RED).attr( 'src', 'images/status_red.png' );
			break ;
		case 'U': // UnAvailable
			var IMG_STATUS_GRAY = tmp_image.cloneNode(true);
			this_td.appendChild(IMG_STATUS_GRAY) ;
			$(IMG_STATUS_GRAY).attr( 'src', 'images/status_gray.png' );
			break ;
		case 'R': // Ringing
			var IMG_STATUS_ORANGE = tmp_image.cloneNode(true);
			this_td.appendChild(IMG_STATUS_ORANGE) ;
			$(IMG_STATUS_ORANGE).attr( 'src', 'images/status_orange.png' );
			break ;
		default :
			var IMG_STATUS_GRAY = tmp_image.cloneNode(true);
			this_td.appendChild(IMG_STATUS_GRAY) ;
			$(IMG_STATUS_GRAY).attr( 'src', 'images/status_gray.png' );
			break ;
	}
};

managerEvents.parseOutput = function(op){
	(function(){
		if( parent.sessionData.DEBUG_MODE ){
			var b = document.createElement('div');
			b.innerHTML = '<PRE>' + op + '</PRE><HR>';

			var wl = _$('waitevent_Log');
			if( wl.childNodes.length ){
				wl.insertBefore(b, wl.childNodes[0] );
			}else{
				wl.appendChild(b);
			}
		}
		var op_LC = op.toLowerCase() ;
		try{
			if( op_LC.contains('event: queuememberstatus') ){
				setTimeout( update_AgentsListing_Table , 1000 );
			}else if( op_LC.contains('event: meetmeleave') ||  op_LC.contains('event: meetmejoin') ){

				if(manager_timers.conferences){ clearTimeout ( manager_timers.conferences ) } ;
				manager_timers.conferences = setTimeout ( update_Conferences_Table , 2000 ) ;

			}else if( op_LC.contains('event: link') ||  op_LC.contains('event: unlink') ){

				if(manager_timers.parkedCalls){ clearTimeout ( manager_timers.parkedCalls ) } ;
				manager_timers.parkedCalls = setTimeout ( update_parkedCalls_Table , 2000 ) ;

			} else if ( op_LC.contains('event: extensionstatus') ) {
				var tmp_chunks = ASTGUI.miscFunctions.getChunksFromManagerOutput(op, 1) ;
				tmp_chunks.each(function(this_chunk){
					if(this_chunk.hasOwnProperty('Event') && this_chunk.Event == 'ExtensionStatus' ){
						var tmp_user = this_chunk.Exten ;
						var new_status = ASTGUI.getUser_DeviceStatus(tmp_user) ;
						managerEvents.updateUserImage(tmp_user , new_status);
					}
				});

				if(manager_timers.parkedCalls){ clearTimeout ( manager_timers.parkedCalls ) } ;
				manager_timers.parkedCalls = setTimeout ( update_parkedCalls_Table , 2000 ) ;

			}
		}catch(err){}
	})();
	this.Watch();
};

managerEvents.Watch = function(){
	$.get( ASTGUI.paths.rawman, {action:'waitevent'}, function(op){managerEvents.parseOutput(op); } );
};

var default_IncomingRule_trunk = function(trunk){
	var cxt = ASTGUI.contexts.TrunkDIDPrefix + trunk + ASTGUI.contexts.TrunkDefaultSuffix ;
	if ( !EX_CF.hasOwnProperty(cxt) ){
		return '?';
	}

	var S3 = EX_CF[cxt].indexOfLike('exten=s,3,') ; // see if it is analog trunk
	var ir_dest_index = (S3 == -1) ? EX_CF[cxt].indexOfLike('exten=s,1,') : S3 ;
	if( ir_dest_index == -1 ){ return '<font color=red>Not Configured</font>';  }
	var ir_dest_line = EX_CF[cxt][ir_dest_index] ;
	return ASTGUI.parseContextLine.showAs(ir_dest_line);
};

var updateTrunkslisting = function(){
	EX_CF = config2json({filename:'extensions.conf', usf:0 });

	var TBL = _$('table_Trunks_list');
	var addCell = ASTGUI.domActions.tr_addCell; // temporarily store the function

	(function(){
		var newRow = TBL.insertRow(-1);
		newRow.className = "frow";
		addCell( newRow , { html:'Status'} );
		addCell( newRow , { html:'Trunk'} );
		addCell( newRow , { html:'Type'} );
		addCell( newRow , { html:'Username'} );
		addCell( newRow , { html:'Port/Hostname/IP'} );
		//addCell( newRow , { html:'Incoming Calls'} );
	})();

	(function(){
		var t = parent.ASTGUI.cliCommand('iax2 show registry') ;
		REGISTRY_OUTPUT.iax2 = ASTGUI.parseCLIResponse(t) ;
		t = parent.ASTGUI.cliCommand('sip show registry') ;
		REGISTRY_OUTPUT.sip = ASTGUI.parseCLIResponse(t) ;
	})();

	( function(){
		var d = [].concat( parent.astgui_managetrunks.listOfSIPTrunks() , parent.astgui_managetrunks.listOfIAXTrunks() );
		d.each( function(item){
			var ttype = parent.astgui_managetrunks.misc.getTrunkType(item) ;
			var newRow = TBL.insertRow(-1);
			newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';

			var reg = ASTGUI.getTrunkStatus(REGISTRY_OUTPUT, item, ttype) ;
			addCell( newRow , { html: reg } );

			addCell( newRow , { html: parent.sessionData.pbxinfo.trunks[ttype][item]['trunkname'] } );
			addCell( newRow , { html: ttype } );
			addCell( newRow , { html: parent.sessionData.pbxinfo.trunks[ttype][item]['username'] || '' } );
			addCell( newRow , { html: parent.sessionData.pbxinfo.trunks[ttype][item]['host'] } );
			//addCell( newRow , { html: default_IncomingRule_trunk(item) });
		} );
	})();

	(function(){
		var c = parent.astgui_managetrunks.listOfAnalogTrunks();
		c.each(function(item){
			var newRow = TBL.insertRow(-1);
			newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';

			addCell( newRow , { html:''} );
			addCell( newRow , { html: parent.sessionData.pbxinfo['trunks']['analog'][item]['trunkname'] } );
			addCell( newRow , { html:'Analog'} );
			addCell( newRow , { html:''} );
			addCell( newRow , { html:'Ports ' + parent.sessionData.pbxinfo['trunks']['analog'][item]['zapchan'] } );
// 			try{
// 				addCell( newRow , { html: default_IncomingRule_trunk(item) });
// 			}catch(err){
// 				addCell( newRow , { html: '?' });
// 			}
		});
	})();

	( function(){
		var d = parent.sessionData.pbxinfo.trunks.providers ;
		for(var e in d){ if(d.hasOwnProperty(e)){

				var ttype = parent.astgui_managetrunks.misc.getTrunkType(e) ;
				var newRow = TBL.insertRow(-1) ;
				newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';
				var reg = ASTGUI.getTrunkStatus(REGISTRY_OUTPUT, e, ttype) ;
				addCell( newRow , { html: reg } );
				addCell( newRow , { html: d[e]['trunkname'] } );
				addCell( newRow , { html: ttype } );
				addCell( newRow , { html: d[e]['username'] || '' } );
				addCell( newRow , { html: d[e]['host'] } );
// 				try{
// 					addCell( newRow , { html: default_IncomingRule_trunk(e) });
// 				}catch(err){
// 					addCell( newRow , { html: '?' });
// 				}
		}}
	})();

	(function (){
		var c = parent.sessionData.pbxinfo['trunks']['pri'] ;
		for(var d in c){if(c.hasOwnProperty(d)){
			var newRow = TBL.insertRow(-1);
			newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';
			addCell( newRow , { html:'' });
			addCell( newRow , { html: c[d]['trunkname'] });
			addCell( newRow , { html: 'Digital (' + c[d]['signalling'] + ')' }); // 
			addCell( newRow , { html: 'Ports: ' + c[d]['zapchan'] });
			addCell( newRow , { html:''} );
		}}


		var c = parent.sessionData.pbxinfo['trunks']['bri'] ;
		for(var d in c){if(c.hasOwnProperty(d)){
			var newRow = TBL.insertRow(-1);
			newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';
			addCell( newRow , { html:'' });
			addCell( newRow , { html: c[d]['trunkname'] });
			addCell( newRow , { html: 'BRI' });
			addCell( newRow , { html: 'Ports: ' + c[d]['ports'] });
			addCell( newRow , { html:''} );
		}}
	})();

};

var updateListingsTable = function(){
	var addCell = ASTGUI.domActions.tr_addCell; // temporarily store the function
	(function(){ // add first row
		var newRow = DOM_table_Ext_list.insertRow(-1);
		newRow.className = "frow";
		addCell( newRow , { html: "<A href='#' onclick=\"managerEvents.updateAllUsersStatus();\"><img src='images/refresh.png' title=' Refresh ' border=0></A>" , width:'18px' });
		addCell( newRow , { html:'Extension' } );
		addCell( newRow , { html:'Name/Label' } );
		addCell( newRow , { html:'Status' } );
		addCell( newRow , { html:'Type', width:'275px'} );
	})();
	(function(){ // List all User Extensions
		var ul = parent.astgui_manageusers.listOfUsers();
		ul = ul.sortNumbers( );
		ul.each(function(user){ // list each user in table
			var ud = parent.sessionData.pbxinfo.users[user];
			var newRow = DOM_table_Ext_list.insertRow(-1);

			var tmp_usertype_a = [];

			if( ud.getProperty('hassip').isAstTrue() ){ tmp_usertype_a.push( '&nbsp;SIP User' ) ; }
			if( ud.getProperty('hasiax').isAstTrue() ){ tmp_usertype_a.push( '&nbsp;IAX User' ) ; }
			if( ud.getProperty('hassip').isAstTrue() && ud.getProperty('hasiax').isAstTrue() ){ tmp_usertype_a = [ 'SIP/IAX User' ] ; }
			if( ud.getProperty('zapchan') ){
				tmp_usertype_a.push( 'Analog User (Port ' + ud['zapchan'] + ')' ) ;
			}

			var tmp_mails = ASTGUI.mailboxCount(user);
			if( tmp_mails.count_new > 0 ){
				var tmp_mails_str = '<font color=#888B8D> Messages : <B><font color=red>' + tmp_mails.count_new + '</font>/' + tmp_mails.count_old + '</B></font>' ;
			}else{
				var tmp_mails_str = '<font color=#888B8D> Messages : ' + tmp_mails.count_new + '/' + tmp_mails.count_old + '</font>' ;
			}

			newRow.className = ((DOM_table_Ext_list.rows.length)%2==1)?'odd':'even';
				if( !ud.getProperty('context') || ! parent.sessionData.pbxinfo.callingPlans[ud.getProperty('context')] ){
					var tmp_userstring = '<u>' + user + '</u> <font color=red>*No DialPlan assigned</font>' ;
				}else{
					var tmp_userstring = '<u>' + user + '</u>' ;
				}

				addCell( newRow , { html: ASTGUI.getUser_DeviceStatus_Image(user) , id : 'TD_USER_DEVICE_STATUS_' + user } );
				addCell( newRow ,
					{	html: tmp_userstring ,
						onclickFunction: function(){
							parent.miscFunctions.click_panel( 'users.html', 'users.html?EXTENSION_EDIT=' + user );
						}
					}
				);

				addCell( newRow , { html: ud.getProperty('fullname') } );
				addCell( newRow , { html: tmp_mails_str } );
				addCell( newRow , { html: tmp_usertype_a.join(',&nbsp;') } );
		});
	})();

	(function(){ // List all meetMe Extensions

		update_Conferences_Table();
		update_parkedCalls_Table();
	})();

	(function(){ // List all Queue Extensions
		var QUEUES_CONF = config2json({filename:'queues.conf', usf:1});
		var m = parent.sessionData.pbxinfo.queues ;
		for( l in m ){
			if( m.hasOwnProperty(l) ){
				var newRow = DOM_table_Ext_list.insertRow(-1);
				newRow.className = ((DOM_table_Ext_list.rows.length)%2==1)?'odd':'even';
				addCell( newRow , { html:''} );
				addCell( newRow , { html: l } );
				addCell( newRow , { html: QUEUES_CONF[l] && QUEUES_CONF[l]['fullname'] || '--' }); // Label
				if( m[l]['configLine'].contains(',1,agentlogin()') ){
					addCell( newRow , { html: '' } );
					addCell( newRow , { html: '<B>Agent Login</B>' });
				}else if( m[l]['configLine'].contains(',1,agentcallbacklogin()') ){
					addCell( newRow , { html: '' } );
					addCell( newRow , { html: '<B>Agent CallBack Login</B>' });	
				}else{
					addCell( newRow , { html: '' } );
					addCell( newRow , { html: 'Call Queue' } );
				}
			}
		}
	})();

	(function(){ // List all RingGroup Extensions
		var c = parent.sessionData.pbxinfo.ringgroups ;
		for(var d in c){if(c.hasOwnProperty(d)){
			var newRow = DOM_table_Ext_list.insertRow(-1);
			newRow.className = ((DOM_table_Ext_list.rows.length)%2==1)?'odd':'even';
			addCell( newRow , { html: '' } );
			addCell( newRow , { html: c[d]['extension'] || '--' } );
			addCell( newRow , { html: c[d]['NAME'] || d } );
			addCell( newRow , { html: '' } );
			addCell( newRow , { html: 'Ring Group' } );
		}}
	})();

	(function(){ // List all VoiceMenu Extensions
		var c = parent.sessionData.pbxinfo.voicemenus ;
		for(var d in c){if(c.hasOwnProperty(d)){
			var newRow = DOM_table_Ext_list.insertRow(-1);
			newRow.className = ((DOM_table_Ext_list.rows.length)%2==1)?'odd':'even';
			addCell( newRow , { html: '' } );
			addCell( newRow , { html: ASTGUI.parseContextLine.getExten(c[d].getProperty('alias_exten')) || '--' } );
			addCell( newRow , { html: c[d]['comment'] || d } );
			addCell( newRow , { html: '' } );
			addCell( newRow , { html: 'Voice Menu' } );
		}}
	})();

	(function(){ // List VoicemailMain
		var tmp = '';
		if( parent.sessionData.pbxinfo['localextensions'].hasOwnProperty('VoiceMailMain') ){
			tmp = ASTGUI.parseContextLine.getExten( parent.sessionData.pbxinfo['localextensions']['VoiceMailMain'] ) ;
		}
		var newRow = DOM_table_Ext_list.insertRow(-1);
		newRow.className = ((DOM_table_Ext_list.rows.length)%2==1)?'odd':'even';
		addCell( newRow , { html: '' } );

		if( tmp ){
			var tmp_voicemails = '<u>' + tmp + '</u>' ;
		}else{
			var tmp_voicemails = '-- <font color=red>*No Extension assigned</font>' ;
		}

		addCell( newRow ,
			{	html: tmp_voicemails ,
				onclickFunction: function(){
					parent.miscFunctions.click_panel( 'voicemail.html');
				}
			}
		);
		addCell( newRow , { html: '<B>Check Voicemails</B>' } );
		addCell( newRow , { html: '' } );
		addCell( newRow , { html: 'VoiceMailMain' } );
	})();
	(function(){ // VoiceMail Groups
		var vmgroups = parent.sessionData.pbxinfo.vmgroups.getOwnProperties();
		vmgroups.each(function( this_vmg_exten ){
			var newRow = DOM_table_Ext_list.insertRow(-1);
			newRow.className = ((DOM_table_Ext_list.rows.length)%2==1)?'odd':'even';
			addCell( newRow , { html: '' } );
			addCell( newRow , { html: this_vmg_exten });
			addCell( newRow , { html: parent.sessionData.pbxinfo.vmgroups[this_vmg_exten].getProperty('label')  });
			addCell( newRow , { html: '' } );
			addCell( newRow , { html: 'VoiceMail Group' } );
		});
	})();

	(function(){
		var newRow = DOM_table_Ext_list.insertRow(-1);
		newRow.className = ((DOM_table_Ext_list.rows.length)%2==1)?'odd':'even';
		addCell( newRow , { html: '' });

		var tmp = parent.sessionData.pbxinfo['localextensions'].getProperty('defaultDirectory') ;
		if( tmp ){
			var tmp_dirExten = '<u>' + tmp + '</u>' ;
		}else{
			var tmp_dirExten = '-- <font color=red>*No Extension assigned</font>' ;
		}

		addCell( newRow ,
			{	html: tmp_dirExten ,
				onclickFunction: function(){ parent.miscFunctions.click_panel( 'directory.html'); }
			}
		);
		addCell( newRow , { html: '<B>Dial by Names</B>' } );
		addCell( newRow , { html: '' } );
		addCell( newRow , { html: 'Directory' } );
	})();
};



var update_needsConfiguratin_list = function(){
	var TBL = _$('table_NeedConfiguration_list');
	var addCell = ASTGUI.domActions.tr_addCell;

	(function(){
		var c = parent.sessionData.pbxinfo.callingRules;
		for(var d in c){ if(c.hasOwnProperty(d)){	
			var crd = c[d];
			var crl = d.withOut(ASTGUI.contexts.CallingRulePrefix);
			if( crd.hasOwnProperty('macroname') && !parent.astgui_managetrunks.misc.getTrunkName(crd.firstTrunk) ){

				var newRow = TBL.insertRow(-1);
				newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';
				addCell( newRow , {
						html: "<i><font color=red>No Trunk Assigned</font></i> for calling rule '" + crl + "'" ,
						align: 'center',
						onclickFunction: function(){ parent.miscFunctions.click_panel( 'callingrules.html'); }
					}
				);
			}
		}}
	})();

	if( TBL.rows.length ){
		$('#ittnc').show();
	}

};

var update_parkedCalls_Table = function(){
	var addCell = ASTGUI.domActions.tr_addCell;
	var TBL = _$('table_ParkedCalls_list');
	ASTGUI.domActions.removeAllChilds(TBL);

	$.get( ASTGUI.paths.rawman, { action: 'ParkedCalls' }, function(op){
		var tmp_chunks = ASTGUI.miscFunctions.getChunksFromManagerOutput(op, 1);
		tmp_chunks.each( function( this_chunk ){
			if( !this_chunk.hasOwnProperty('Event') || !this_chunk.hasOwnProperty('Exten') ) return ;
			newRow = TBL.insertRow(-1);
			var newcell = newRow.insertCell( newRow.cells.length );
			newcell.innerHTML =  this_chunk.CallerID + ' (' + this_chunk.Channel + ') is Parked on ' + this_chunk.Exten ; // this_chunk.Timeout
		});

		if( !TBL.rows.length ){
			newRow = TBL.insertRow(-1);
			var newcell = newRow.insertCell( newRow.cells.length );
			newcell.align =  'center' ;
			newcell.innerHTML =  'No Parked Calls' ;
		}
	});
};

var update_Conferences_Table = function(){
	var addCell = ASTGUI.domActions.tr_addCell;
	var TBL = _$('table_Meetmes_list');
	ASTGUI.domActions.removeAllChilds(TBL);

	var active_conferences = {};
	(function(){
		var meetme_status = ASTGUI.cliCommand('meetme');
		meetme_status = parent.ASTGUI.parseCLIResponse(meetme_status);
		if ( meetme_status.contains('No active MeetMe conferences') ){
			// No active MeetMe conferences.
		}else{
			// sx00i*CLI> meetme
			// Conf Num       Parties        Marked     Activity  Creation
			// 6302           0001           N/A        00:00:09  Static
			// 6300           0001           N/A        00:02:51  Static
			// * Total number of MeetMe users: 2
			meetme_status = meetme_status.split('\n');
			while( meetme_status.length ){
				var this_line = meetme_status[0];
				meetme_status.removeFirst();
				this_line = this_line.trim();
				if( !this_line || this_line.beginsWith('Conf Num') ||  this_line.beginsWith('* Total number') ) { continue; }
				var tmp_vars = this_line.split(/\s+/); // ['6302','0001','N/A','00:00:09', 'Static' ]
				active_conferences[ tmp_vars[0] ] = {} ;
				active_conferences[ tmp_vars[0] ]['count'] = tmp_vars[1] ;
				active_conferences[ tmp_vars[0] ]['duration'] = tmp_vars[3] ;
			}
		}
	})();

	var active_count = 0;
	var td_COUNT = 0, m = parent.sessionData.pbxinfo.conferences ;
	for( l in m ){ if( m.hasOwnProperty(l) && l !='admin'){

		if( td_COUNT == 3 || td_COUNT == 0 ){
			newRow = TBL.insertRow(-1);
			//newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';
			td_COUNT = 0;
		}

		var newcell = newRow.insertCell( newRow.cells.length ); td_COUNT++ ;
		newcell.width = 120 ;
		newcell.align = 'center' ;

		if( active_conferences.hasOwnProperty(l) ){
			active_count++;
			newcell.innerHTML =  l + '<BR><font color=red>' + Number(active_conferences[l].count) + ' Users</font> - ' + active_conferences[l].duration ;
		}else{
			newcell.innerHTML =  l + '<BR><font color=green>Not in use</font>' ;
		}
	}}

	if( !TBL.rows.length ){ 
		newRow = TBL.insertRow(-1);
		var newcell = newRow.insertCell( newRow.cells.length );
		newcell.align =  'center' ;
		newcell.innerHTML =  'No Conferences setup' ;
	}

	if(active_count){
		if(manager_timers.conferences){ clearTimeout ( manager_timers.conferences ) } ;
		manager_timers.conferences = setTimeout ( update_Conferences_Table , 5000 ) ;
	}

};


var update_AgentsListing_Table = function(){
	var addCell = ASTGUI.domActions.tr_addCell; // temporarily store the function
	var TBL = _$('table_Agents_list') ;
	ASTGUI.domActions.removeAllChilds(TBL);

	$.get( ASTGUI.paths.rawman, { action: 'Agents' }, function(op){
		var tmp_chunks = ASTGUI.miscFunctions.getChunksFromManagerOutput(op, 1) ;
		var newRow ;
		var td_COUNT = 0;
		tmp_chunks.each( function(this_chunk){
			// Event: Agents
			// Agent: 6000
			// Name: Some User
			// Status: AGENT_LOGGEDOFF / AGENT_IDLE / AGENT_ONCALL / AGENT_UNKNOWN
			// LoggedInChan: n/a
			// LoggedInTime: 0
			// TalkingTo: n/a
			if(this_chunk.hasOwnProperty('Event') && this_chunk.hasOwnProperty('Status') && this_chunk.Event == 'Agents' ){
				if(this_chunk.Status == 'AGENT_UNKNOWN'){ return; }
				var tmp_agent = this_chunk.Agent ;
				var tmp_agent_Status = this_chunk.Status ;
				if( td_COUNT == 4 || td_COUNT == 0 ){
					newRow = TBL.insertRow(-1);
					//newRow.className = ((TBL.rows.length)%2==1)?'odd':'even';
					td_COUNT = 0;
				}
				var newcell = newRow.insertCell( newRow.cells.length ); td_COUNT++ ;
				newcell.width = 120 ;
				newcell.align = 'center' ;

				if(tmp_agent_Status != 'AGENT_LOGGEDOFF'){ // logged in 
					newcell.innerHTML = "<img src='images/agent_loggedin.png' border=0 alt='Logged On: " + this_chunk.LoggedInChan + "'><BR>" + tmp_agent ;

					newcell.appendChild( managerEvents.agentLogoutLink(tmp_agent) );

				}else{
					newcell.innerHTML = "<img src='images/agent_loggedout.png' border=0><BR>" + tmp_agent ;
					newcell.appendChild( managerEvents.agentLoginLink(tmp_agent) );
				}
			}
		});

		if( TBL.rows.length ){ $('#table_Agents_list_container').show() ; }
	});
};

var localajaxinit = function(){
	var ST ;
	var loadIfeverythingParsed = function(){
		if ( !parent.sessionData.finishedParsing) return;

		clearInterval( ST );
		top.document.title = "System Status" ;
		DOM_table_Ext_list = _$('table_Ext_list');
		try{ updateListingsTable(); }catch(err){}

		setTimeout( managerEvents.Watch, 2000 );

		try{ update_AgentsListing_Table(); }catch(err){}

		updateTrunkslisting();
		update_needsConfiguratin_list();
	
		(function(){
			if( parent.sessionData.PLATFORM.isAA50 ) {
				ASTGUI.systemCmdWithOutput( 'firmware_version' , function(a){
					_$('firmware_div').innerHTML = 'Firmware : v' + a.trim() ;
				});
			}else{
				ASTGUI.systemCmdWithOutput( 'uptime' , function(a){
					_$('firmware_div').innerHTML = 'Uptime : ' + a.trim() ;
				});
			}
		})();	
	};

	ST = setInterval( loadIfeverythingParsed , 200 );
};
