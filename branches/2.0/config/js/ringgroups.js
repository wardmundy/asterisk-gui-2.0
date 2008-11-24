/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * ringgroups.html functions
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
/*
	[ringroups-custom-1]
	gui_ring_groupname = Test
	exten = s,1,NoOp(RINGGROUP)
	exten = s,n,Dial(Zap/1,30,i)
	exten = s,n,Dial(Zap/4,30,i)
	exten = s,n,Dial(IAX2/6000,30,i)
	exten = s,n,Hangup

		NAME : RINGGROUPNAME,
		strategy : 'ringinorder',
		members : ['Zap/1','Zap/4', 'IAX2/6000']
		extension : '2345' ,
		ringtime : '30',
		fallback : 'Hangup'
*/

var isNewRG;
var RG_EDITING; // ring group being edited
var listOfDialDevices = [];
var loadDOMelements = function(){
	DOM_ringgroup_editdiv = _$('ringgroup_editdiv');
	DOM_table_rgoups_list = _$('table_rgoups_list');
	DOM_text_rgname = _$('text_rgname');
	DOM_select_strategy = _$('select_strategy');
	DOM_select_ringthesechannels = _$('select_ringthesechannels');
	DOM_select_fromlistofchannels = _$('select_fromlistofchannels');
		DOM_button_add_toringlist = _$('button_add_toringlist');
		DOM_button_remove_fromringlist = _$('button_remove_fromringlist');
		DOM_button_removeall_fromringlist = _$('button_removeall_fromringlist');
	DOM_text_rgExten = _$('text_rgExten');
	DOM_text_ringTime = _$('text_ringTime');
	DOM_rg_fb_select = _$('rg_fb_select');

};

var ringGroupExistsbyThisName = function( thisName ){
	var m = parent.sessionData.pbxinfo.ringgroups ;

	for( l in m ){ if( m.hasOwnProperty(l) ){
		if ( isNewRG == true && m[l].getProperty('NAME') == thisName ){
			return true;
		}
		if ( isNewRG == false && l != RG_EDITING ){
			var ml_name = ASTGUI.toCustomObject( m[l] );
			if( ml_name.getProperty('NAME') == thisName  ){
				return true;
			}
		}
	}}
	return false;
};


var save_rg = function(){
	if ( !ASTGUI.checkRequiredFields([DOM_text_rgname, DOM_select_strategy, DOM_text_ringTime, DOM_rg_fb_select, DOM_text_rgExten ]) ){
		return ;
	}
	if ( !ASTGUI.validateFields([ DOM_text_rgname, DOM_text_rgExten, DOM_text_ringTime ]) ){
		return ;
	}
	if ( ringGroupExistsbyThisName(ASTGUI.getFieldValue(DOM_text_rgname)) ){
		ASTGUI.highlightField( DOM_text_rgname , 'duplicate RingGroup Name !');
		return;
	}
	var TEMP_members = ASTGUI.selectbox.readAllValues(DOM_select_ringthesechannels) ;
	if( !TEMP_members.length ){
		ASTGUI.highlightField(DOM_select_ringthesechannels, 'You need to have at least one member in the ring group !!');
		parent.ASTGUI.dialog.hide();
		return;
	}

	var RG_EXTEN = ASTGUI.getFieldValue( DOM_text_rgExten );
	if( !isNewRG ){ // if editing existing ring group
		parent.astgui_manageRingGroups.deleteRg(RG_EDITING) ;
	}else{ // if is a new ring group
		if( parent.miscFunctions.ifExtensionAlreadyExists(RG_EXTEN) ){
			ASTGUI.highlightField(DOM_text_rgExten , 'Extension already exists');
			parent.ASTGUI.dialog.hide();
			return;
		}

		if(!ASTGUI.miscFunctions.isExtensionInRange( RG_EXTEN , 'rge_start' , 'rge_end')){
			ASTGUI.highlightField(DOM_text_rgExten, 'Extension is not in preferred range');
			parent.ASTGUI.dialog.hide();
			return;
		}
	}


	var tmp_obj = {
		NAME : DOM_text_rgname.value ,
		strategy : DOM_select_strategy.value ,
		members : TEMP_members,
		extension : RG_EXTEN ,
		ringtime : DOM_text_ringTime.value ,
		fallback : ''
	};

	tmp_obj = ASTGUI.toCustomObject(tmp_obj);
	tmp_obj.fallback = ASTGUI.getFieldValue( DOM_rg_fb_select );
	var later = function(){
		var msg = ( isNewRG ) ? 'RingGroup Created' : 'RingGroup Updated';
		ASTGUI.feedback({ msg: msg , showfor:2 });
		$(DOM_ringgroup_editdiv).hide();
		window.location.reload();
	};
	parent.astgui_manageRingGroups.createNewRg( tmp_obj, later, RG_EDITING ) ;
};


var resetFields = function(){

	if(isNewRG){
		_$('rgedit_form_caption').innerHTML = 'New RingGroup';
		DOM_text_rgname.value = '';
		//DOM_select_strategy.selectedIndex = -1 ;
		ASTGUI.selectbox.clear( DOM_select_ringthesechannels );
		ASTGUI.selectbox.clear( DOM_select_fromlistofchannels );
		listOfDialDevices.each(function(device){ 
			var tmp_ext = device.afterChar('/');
			var tmp_techn = device.beforeChar('/');

			if( tmp_techn.toLowerCase() == 'zap' ){

				var this_analogStation_user = '';
				for ( var q in parent.sessionData.pbxinfo.users ){ if( parent.sessionData.pbxinfo.users.hasOwnProperty(q) ){
					if( parent.sessionData.pbxinfo.users[q].getProperty('zapchan') == tmp_ext ){
						this_analogStation_user = q + '(AnalogPort ' + tmp_ext + ') ' + parent.sessionData.pbxinfo.users[q].getProperty('fullname') ;
						ASTGUI.selectbox.append( DOM_select_fromlistofchannels, this_analogStation_user , device);
						return;
					}
				}}

			}else{

				if( parent.sessionData.pbxinfo.users[tmp_ext] && parent.sessionData.pbxinfo.users[tmp_ext].fullname ){
					var tmp_name = parent.sessionData.pbxinfo.users[tmp_ext].fullname || '?' ;
				}else{
					return;
				}
				ASTGUI.selectbox.append( DOM_select_fromlistofchannels, tmp_ext + '('+ tmp_techn +')' + ' ' + tmp_name , device);
			}
		});
		DOM_text_rgExten.value = '' ;

		ASTGUI.selectbox.populateArray( DOM_rg_fb_select ,  parent.miscFunctions.getAllDestinations() );
		ASTGUI.resetTheseFields([ DOM_rg_fb_select , DOM_select_strategy , DOM_text_ringTime ]);

		(function(){
			var tmp_allextensions = ASTGUI.cloneObject( parent.miscFunctions.getAllExtensions() );
			DOM_text_rgExten.value  = tmp_allextensions.firstAvailable( parent.sessionData.GUI_PREFERENCES.getProperty('rge_start') );
		})();

		return ;
	}

	var c = parent.sessionData.pbxinfo['ringgroups'][RG_EDITING];
	DOM_text_rgname.value = c.NAME ;
	_$('rgedit_form_caption').innerHTML = 'Edit RingGroup - ' + c.NAME ;
	ASTGUI.selectbox.selectOption( DOM_select_strategy  , c['strategy'] );
	ASTGUI.selectbox.clear( DOM_select_ringthesechannels );
	var mbrs = ASTGUI.cloneObject(c['members']);
	mbrs.each(function(device){ 
		var tmp_ext = device.afterChar('/');
		var tmp_techn = device.beforeChar('/');

		if( tmp_techn.toLowerCase() == 'zap' ){
			var this_analogStation_user = '';
			for( var q in parent.sessionData.pbxinfo.users ){ if( parent.sessionData.pbxinfo.users.hasOwnProperty(q) ){
				if( parent.sessionData.pbxinfo.users[q].getProperty('zapchan') == tmp_ext ){
					this_analogStation_user = q + '(AnalogPort ' + tmp_ext + ') ' + parent.sessionData.pbxinfo.users[q].getProperty('fullname') ;
					ASTGUI.selectbox.append( DOM_select_ringthesechannels, this_analogStation_user , device );
					return;
				}
			}}
		}else{
			var tmp_name = (parent.sessionData.pbxinfo.users[tmp_ext] && parent.sessionData.pbxinfo.users[tmp_ext].fullname) || '?';
			ASTGUI.selectbox.append( DOM_select_ringthesechannels, tmp_ext + '('+ tmp_techn +')' + ' ' + tmp_name , device);
		}
	});


	ASTGUI.selectbox.clear( DOM_select_fromlistofchannels );
	listOfDialDevices.each(function(device){ if( ! mbrs.contains(device) ){
		var tmp_ext = device.afterChar('/');
		var tmp_techn = device.beforeChar('/');

		if( tmp_techn.toLowerCase() == 'zap' ){
			var this_analogStation_user = '';
			for( var q in parent.sessionData.pbxinfo.users ){ if( parent.sessionData.pbxinfo.users.hasOwnProperty(q) ){
				if( parent.sessionData.pbxinfo.users[q].getProperty('zapchan') == tmp_ext ){
					this_analogStation_user = q + '(AnalogPort ' + tmp_ext + ') ' + parent.sessionData.pbxinfo.users[q].getProperty('fullname') ;
					ASTGUI.selectbox.append( DOM_select_fromlistofchannels, this_analogStation_user , device );
					return;
				}
			}}
		}else{
			var tmp_name = (parent.sessionData.pbxinfo.users[tmp_ext] && parent.sessionData.pbxinfo.users[tmp_ext].fullname)  || '?' ;
			ASTGUI.selectbox.append( DOM_select_fromlistofchannels, tmp_ext + '('+ tmp_techn +')' + ' ' + tmp_name , device);
		}
	}});
	DOM_text_rgExten.value = (c['extension'])?c['extension']:'' ;
	DOM_text_ringTime.value = (c['ringtime'])?c['ringtime']:'' ;
	// select value from select box DOM_rg_fb_select
	var destinations = parent.miscFunctions.getAllDestinations() ;

	var destinations_WithOut_ThisRingGroup = [];
	destinations.each( function( this_object ){
		if( this_object.optionValue != 'Goto('+ RG_EDITING +'|s|1)' && this_object.optionValue != 'Goto('+ RG_EDITING +',s,1)' ){
			destinations_WithOut_ThisRingGroup.push( this_object );
		}
	});
	ASTGUI.selectbox.populateArray( DOM_rg_fb_select , destinations_WithOut_ThisRingGroup );
	ASTGUI.selectbox.selectDestinationOption( DOM_rg_fb_select ,  ( c['fallback'] ) ? c['fallback'] : '' );
};

var delete_rg_confirm = function(d){
	if (!confirm('Delete RingGroup ?')) { return; }
	parent.astgui_manageRingGroups.deleteRg(d) ;
	ASTGUI.feedback( { msg:'Ring Group deleted', showfor:2 });
	window.location.reload();
};

var show_NewRingGroup_form = function(){
	RG_EDITING = '';
	isNewRG = true;
	resetFields();
	ASTGUI.feedback( { msg: 'Create New RingGroup !', showfor: 2 , color: 'green', bgcolor: '#FFFFFF' } );
	$(DOM_ringgroup_editdiv).showWithBg();
};

var edit_rg_form = function(d){
	RG_EDITING = d;
	isNewRG = false;
	resetFields();
	ASTGUI.feedback( { msg: 'Edit RingGroup !', showfor: 2 , color: 'green', bgcolor: '#FFFFFF' } );
	$(DOM_ringgroup_editdiv).showWithBg();
};

var update_RingGroupsTable = function(){
	var addCell = ASTGUI.domActions.tr_addCell; // temporarily store the function
	(function(){ // add first row
		var newRow = DOM_table_rgoups_list.insertRow(-1);
		newRow.className = "frow";
		addCell( newRow , { html:'', width:'10px'} );
		addCell( newRow , { html: 'Extension' } );
		addCell( newRow , { html:'Ring Group'} );
		addCell( newRow , { html:'Members'} );
		addCell( newRow , { html:''} );
	})();

	var c = parent.sessionData.pbxinfo.ringgroups ;
	for(var d in c){if(c.hasOwnProperty(d)){
		var newRow = DOM_table_rgoups_list.insertRow(-1);
		var rn = DOM_table_rgoups_list.rows.length;
		newRow.className = ((rn)%2==1)?'odd':'even';
		addCell( newRow , { html: '' } );
		addCell( newRow , { html: c[d]['extension'] } );
		addCell( newRow , { html: c[d]['NAME'] } );
		
		var TMP_MEMBERS = [];
		var CDM = ASTGUI.cloneObject(c[d]['members']);
		CDM.each(function(device){
			var tmp_ext = device.afterChar('/');
			var tmp_techn = device.beforeChar('/');

			if( tmp_techn.toLowerCase() == 'zap' ){
				var this_analogStation_user = '';
				for( var q in parent.sessionData.pbxinfo.users ){ if( parent.sessionData.pbxinfo.users.hasOwnProperty(q) ){
					if( parent.sessionData.pbxinfo.users[q].getProperty('zapchan') == tmp_ext ){
						this_analogStation_user = q + '(AnalogPort ' + tmp_ext + ') ' + parent.sessionData.pbxinfo.users[q].getProperty('fullname') ;
						TMP_MEMBERS.push( this_analogStation_user );
						break;
					}
				}}
				if(! this_analogStation_user ){
					TMP_MEMBERS.push( 'AnalogPort ' + tmp_ext + ' ?' );
				}
			}else{
				var tmp_name = (parent.sessionData.pbxinfo.users[tmp_ext] && parent.sessionData.pbxinfo.users[tmp_ext].fullname)  || '?';
				TMP_MEMBERS.push( tmp_ext + '('+ tmp_techn +')' + ' ' + tmp_name );
			}


		});
		
		addCell( newRow , { html: TMP_MEMBERS.join(', ') } );
		var tmp = "<span class='guiButton' onclick=\"edit_rg_form('" + d +"')\">Edit</span>" + 
				"<span class='guiButtonDelete' onclick=\"delete_rg_confirm('" + d +"')\">Delete</span>" ;
		addCell( newRow , { html: tmp } );
	}}
	if(DOM_table_rgoups_list.rows.length == 1){
		ASTGUI.domActions.clear_table(DOM_table_rgoups_list);
		var newRow = DOM_table_rgoups_list.insertRow(-1);
		newRow.className = 'even';
		addCell( newRow , { html:'No RingGroups defined !!'} );
		return ;
	}
};


var localajaxinit = function(){
	top.document.title = 'Manage RingGroups' ;
	if( !ASTGUI.miscFunctions.alertIfRangeisNotdefined('rge_start','rge_end', 'RingGroups') ){
		$('.top_buttons').hide();
		return;
	}
	loadDOMelements();
	
	(function (){
		var t = parent.astgui_manageusers.listOfUsers();
		t.each(function(usr){	
			if( parent.sessionData.pbxinfo['users'][usr]['hassip']  && parent.sessionData.pbxinfo['users'][usr]['hassip'] == 'yes' ){
				listOfDialDevices.push( 'SIP/' + usr );
			}
			if( parent.sessionData.pbxinfo['users'][usr]['hasiax']  && parent.sessionData.pbxinfo['users'][usr]['hasiax'] == 'yes' ){
				listOfDialDevices.push( 'IAX2/' + usr );
			}
		});
		t = parent.sessionData.FXS_PORTS_DETECTED ;
		t.each(function(fxs){
			listOfDialDevices.push('Zap/' + fxs );
		});

		ASTGUI.events.add( DOM_button_add_toringlist , 'click' , function(){
			var t = DOM_select_fromlistofchannels.value ; if(!t){return;}
			var s = DOM_select_fromlistofchannels.options[DOM_select_fromlistofchannels.selectedIndex].text ; if(!s){ s = t; }
			DOM_select_fromlistofchannels.remove( DOM_select_fromlistofchannels.selectedIndex );
			ASTGUI.selectbox.append( DOM_select_ringthesechannels, s , t );
		});
		ASTGUI.events.add( DOM_button_remove_fromringlist , 'click' , function(){
			var t = DOM_select_ringthesechannels.value ; if(!t){return;}
			var s = DOM_select_ringthesechannels.options[DOM_select_ringthesechannels.selectedIndex].text ; if(!s){ s = t; }
			DOM_select_ringthesechannels.remove( DOM_select_ringthesechannels.selectedIndex );
			if( listOfDialDevices.contains(t) ){ ASTGUI.selectbox.append( DOM_select_fromlistofchannels, s, t ); }
		});
		ASTGUI.events.add( DOM_button_removeall_fromringlist , 'click' , function(){
			ASTGUI.selectbox.clear( DOM_select_ringthesechannels );
			ASTGUI.selectbox.clear( DOM_select_fromlistofchannels );
			listOfDialDevices.each(function(device){ 
				var tmp_ext = device.afterChar('/');
				var tmp_techn = device.beforeChar('/');
	
				if( tmp_techn.toLowerCase() == 'zap' ){
					var this_analogStation_user = '';
					for ( var q in parent.sessionData.pbxinfo.users ){ if( parent.sessionData.pbxinfo.users.hasOwnProperty(q) ){
						if( parent.sessionData.pbxinfo.users[q].getProperty('zapchan') == tmp_ext ){
							this_analogStation_user = q + '(AnalogPort ' + tmp_ext + ') ' + parent.sessionData.pbxinfo.users[q].getProperty('fullname') ;
							ASTGUI.selectbox.append( DOM_select_fromlistofchannels, this_analogStation_user , device);
							return;
						}
					}}
				}else{
					if( parent.sessionData.pbxinfo.users[tmp_ext] && parent.sessionData.pbxinfo.users[tmp_ext].fullname ){
						var tmp_name = parent.sessionData.pbxinfo.users[tmp_ext].fullname || '?' ;
					}else{
						return;
					}
					ASTGUI.selectbox.append( DOM_select_fromlistofchannels, tmp_ext + '('+ tmp_techn +')' + ' ' + tmp_name , device);
				}
			});
		});

		ASTGUI.events.add( 'button_addall_toringlist' , 'click' , function(){
			ASTGUI.selectbox.clear( DOM_select_ringthesechannels );
			ASTGUI.selectbox.clear( DOM_select_fromlistofchannels );

			listOfDialDevices.each(function(device){ 
				var tmp_ext = device.afterChar('/');
				var tmp_techn = device.beforeChar('/');
	
				if( tmp_techn.toLowerCase() == 'zap' ){
					var this_analogStation_user = '';
					for ( var q in parent.sessionData.pbxinfo.users ){ if( parent.sessionData.pbxinfo.users.hasOwnProperty(q) ){
						if( parent.sessionData.pbxinfo.users[q].getProperty('zapchan') == tmp_ext ){
							this_analogStation_user = q + '(AnalogPort ' + tmp_ext + ') ' + parent.sessionData.pbxinfo.users[q].getProperty('fullname') ;
							ASTGUI.selectbox.append( DOM_select_ringthesechannels, this_analogStation_user , device);
							return;
						}
					}}
				}else{
					if( parent.sessionData.pbxinfo.users[tmp_ext] && parent.sessionData.pbxinfo.users[tmp_ext].fullname ){
						var tmp_name = parent.sessionData.pbxinfo.users[tmp_ext].fullname || '?' ;
					}else{
						return;
					}
					ASTGUI.selectbox.append( DOM_select_ringthesechannels, tmp_ext + '('+ tmp_techn +')' + ' ' + tmp_name , device);
				}
			});
		});

	})();

	update_RingGroupsTable();

};
