/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * sysinfo.html functions
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

var percentage_usage = function(du){
	var get_CF_percent = function(a){
		var du_lines = a.split('\n');
		var line;
		for( var t =0 ; t < du_lines.length ; t++ ){
			line = du_lines[t];
			if( ! line.beginsWith('/dev/hda1 ') ){ continue; }
	
			var before_p_str = line.beforeChar('%');
			var start_p = before_p_str.lastIndexOf(' ');
			return before_p_str.substring(start_p+1);
		}
		return 0;
	};
	var p = get_CF_percent(du);
	if( p == 0 ){return;}
	var width_1 = Math.floor( Number(p) * 1.5 ) ;
	var width_2 = 150 - width_1 ;
	var table_percent = "<table><tr><td valign=top>" 
			+ "<table width=150 border=0 cellpadding=0 cellspacing=0 bgcolor=#E6C79D>"
			+ "<tr><td width='" + width_1 + "' height=12 bgcolor='#6D4B1D'></td>"
			+ "<td width='" + width_2 + "'></td></tr></table>"
		+ "</td><td>&nbsp;" + p + "% used</td>"
		+ "</tr></table>";
	_$('CF_Usage_td').innerHTML = table_percent ;
	_$('CF_Usage').style.display = '';
};

function getsysinfohtml(){
	ASTGUI.systemCmdWithOutput( 'uname -a' , function(output){ _$('osversion').innerHTML = output; });
	ASTGUI.systemCmdWithOutput( 'uptime' , function(output){ _$('uptime').innerHTML = output.replace(/load average/, "<BR>Load Average"); });
	ASTGUI.systemCmdWithOutput( 'date' , function(output){ 
		_$('today').innerHTML = (parent.sessionData.PLATFORM.isAA50) ? ASTGUI.toLocalTime(output).camelize() : output ;
		if(parent.sessionData.PLATFORM.isAA50) {
			_$('today').innerHTML += "&nbsp;&nbsp;<A href='date.html' class='splbutton' title='Click to update Date and Time'><B>Edit</B></A>";
		}
	});
	ASTGUI.systemCmdWithOutput( 'hostname' , function(output){ 
		_$('hostname').innerHTML = output ;
	});

	_$('asterisk').innerHTML =  parent.sessionData.AsteriskVersionString + "<BR>" + "Asterisk GUI-version : " + ( parent.sessionData.gui_version || ASTGUI.globals.version ) ;
	$('#tabbedMenu').find('A:eq(0)').click();
}

var localajaxinit = function(){
	top.document.title = 'System Information' ;
	parent.ASTGUI.dialog.waitWhile('Loading system Information ...');

	(function(){
		var t = [{	url:'#',
				desc:'General',
				click_function: function(){
					$('.hideall').hide();
					$('#osversion_div').show();
					$('#uptime_div').show();
					$('#asterisk_div').show();
					$('#today_div').show();
					$('#hostname_div').show();
				}
			},{	url: '#',
				desc: 'Network',
				click_function: function(){
					$('.hideall').hide();
					ASTGUI.systemCmdWithOutput( 'ifconfig' , function(output){
						_$('ifconfig').innerHTML = '<pre>' + output +'</pre>' ;
						$('.hideall').hide();
						$('#ifconfig_div').show();
					});
				}
			},{	url: '#',
				desc: 'Disk Usage',
				click_function: function(){
					$('.hideall').hide();
					ASTGUI.systemCmdWithOutput( 'df -k' , function(output){
						_$('diskusage').innerHTML = '<pre>' + output +'</pre>';
						if(parent.sessionData.PLATFORM.isAA50) {
							try{
								percentage_usage(output);
							}catch(err){
								ASTGUI.Log.Debug( '<B>Error Trying to calculate CF usage %');
							}
						}
						$('.hideall').hide();
						$('#df_div').show();
					});
				}
			},{	url: '#',
				desc: 'Memory Usage',
				click_function: function(){
					$('.hideall').hide();
					ASTGUI.systemCmdWithOutput( 'free' , function(free){
						_$('memoryusage').innerHTML = '<pre>' + free +'</pre>';
						$('.hideall').hide();
						$('#memory_div').show();
					});
				}
			}];
		if( parent.sessionData.PLATFORM.isAA50 ) {
			t.push({	url:'#',
					desc:'S800i Config',
					click_function: function(){
						$('.hideall').hide();
						ASTGUI.systemCmdWithOutput( 's800iconfig' , function(output){
							_$('s800i_config').innerHTML = '<PRE>' + output.replace(/S800i Product Configuration/, '') + '</PRE>';
							$('.hideall').hide();
							$('#s800i_div').show();
						});
					}
				});
			t.push({	url:'#',
					desc:'DHCP Leases',
					click_function: function(){
						$('.hideall').hide();
						ASTGUI.systemCmdWithOutput( 'dhcp_dump' , function(output){
							$('#s800i_dhcpClients_output').html('<PRE>' + output + '</PRE>');
							$('.hideall').hide();
							$('#s800i_dhcpClients_div').show();
						});
					}
				});
		}
		ASTGUI.tabbedOptions( _$('tabbedMenu') , t );
	})();
	parent.ASTGUI.dialog.hide();
	getsysinfohtml();
}
