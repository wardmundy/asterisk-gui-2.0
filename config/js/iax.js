/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * iax.html functions
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
//Realtime :  'rtcachefriends', 'rtignoreexpire', 'rtupdate', 'rtautoclear' 
// CDR: amaflags, accountcode

var fieldnames = [ 'adsi', 'authdebug', 'autokill', 'bandwidth', 'bindaddr', 'bindport', 'codecpriority', 'delayreject', 'dropcount', 'forcejitterbuffer', 'iaxcompat', 'iaxmaxthreadcount', 'iaxthreadcount', 'jitterbuffer', 'jittershrinkrate', 'language', 'maxexcessbuffer', 'maxjitterbuffer', 'maxjitterinterps', 'maxregexpire', 'minexcessbuffer', 'minregexpire', 'mohinterpret', 'mohsuggest', 'nochecksums','resyncthreshold', 'tos', 'trunkfreq', 'trunktimestamps' ];

var localajaxinit = function(){
	top.document.title = 'global IAX settings' ;
	(function(){
		var hideall = function(){
			$('#iaxoptions_general').hide() ;
			//$('#iaxoptions_cdr').hide() ;
			$('#iaxoptions_jitterBuffer').hide() ;
			$('#iaxoptions_trunkregistration').hide() ;
			//$('#iaxoptions_realtime').hide() ;
			$('#iaxoptions_Codecs').hide() ;
		};

		var t = [
			{url:'#', desc:'General', click_function: function(){ hideall(); $('#iaxoptions_general').show(); }  } ,
			//{url:'#', desc:'CDR', click_function: function(){ hideall(); $('#iaxoptions_cdr').show(); } },
			{url:'#', desc:'Jitter Buffer', click_function: function(){ hideall(); $('#iaxoptions_jitterBuffer').show();} },
			{url:'#', desc:'Registration', click_function: function(){ hideall(); $('#iaxoptions_trunkregistration').show(); } },
			//{url:'#', desc:'Realtime', click_function: function(){ hideall(); $('#iaxoptions_realtime').show(); } },
			{url:'#', desc:'Codecs', click_function: function(){ hideall(); $('#iaxoptions_Codecs').show(); } }
		];
		ASTGUI.tabbedOptions( _$('tabbedMenu') , t );
		$('#tabbedMenu').find('A:eq(0)').click();
	})();


	var c = context2json({ filename:'iax.conf' , context : 'general' , usf:1 });
	var AU = ASTGUI.updateFieldToValue ; // temporarily cache function
	fieldnames.each( function(fld){
		var val = ( c[fld] ) ? c[fld] : '';
		AU(fld,val) ;
	});
	var disallowed = false;
	var real_codecs;
	ASTGUI.CODECSLIST.populateCodecsList(_$('allow'));
	if( c.hasOwnProperty('allow') ){ real_codecs = c['array']; }
	if( c.hasOwnProperty('disallow') ) { disallowed = c['disallow'].split(','); } 
	var default_selected = ['ulaw','alaw','gsm'];
	default_selected.each( function(val) {
		if (!disallowed.contains(val)) {
			real_codecs = real_codecs + "," + val;
		}
	});
	ASTGUI.CODECSLIST.selectCodecs(_$('allow'), real_codecs);
}


var saveChanges = function(){
	var cat = 'general';
	var after = function(){
		parent.ASTGUI.dialog.hide();
		ASTGUI.feedback({ msg:'Changes Saved !', showfor:2 });
	};
	var skip_ifempty = ['register', 'localnet', 'externhost', 'externip'];
	var x = new listOfActions('iax.conf');
	var AG = ASTGUI.getFieldValue;
	fieldnames.each( function(fld){
		var val = AG(fld) ;
		if (skip_ifempty.contains(fld)) {
			if (val.trim() == "") {
				return;
			}
		}
		x.new_action('update', cat , fld , val) ;
	});
	x.new_action('delete', cat , 'disallow', '' ) ;
	x.new_action('delete', cat , 'allow', '' ) ;
	x.new_action('append', cat , 'disallow', 'all' ) ;
	x.new_action('append', cat , 'allow', ASTGUI.CODECSLIST.getSelectedCodecs(_$('allow')) ) ;

	parent.ASTGUI.dialog.waitWhile(' Saving ...');
	setTimeout( function(){ x.callActions(after) ; } , 300 );
}
