/*
    Copyright (C) 2008  向日

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// ==UserScript==
// @name Helianthus.Annuus: Main Script
// @namespace http://forum.hkgolden.com/
// @description version 2.x.x_alpha by 向日
// @include http://forum*.hkgolden.com/*
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js
// ==/UserScript==

/*	Some notes for developers:
 *
 *	jQuery - with plugins: jQuery UI, (v)sprintf
 *	Cross-brower - Theoretically. For now I have only tested it on {Maxthon 2 w/ IE 7} & {FF 3}, please let me know if there is a way to use scripts on other browsers
 *	No base64 encoded data - Not supported by IE 7- [sosad]
 *	Used unsafeWindow on GM - A lot easier for me to write the script
 *
 */

/////////////////// START OF - [jQuery] ///////////////////

/*
(function()
{
	var nodScript = document.createElement('script');
	nodScript.type = 'text/javascript';
	nodScript.src = 'http://jqueryjs.googlecode.com/files/jquery-1.2.6.pack.js';
	document.documentElement.firstChild.appendChild(nodScript);
})();
*/

AN = { init: {}, func: {} };

(function()
{
	if(typeof jQuery == 'undefined')
	{
		return setTimeout(arguments.callee, 500);
	}

	if(typeof unsafeWindow != 'undefined')
	{
		$window = unsafeWindow;
		$window.$ = jQuery;
		$window.AN = AN;
	}
	else
	{
		$window = window;
	}

	$(function(){ AN.init.addPlugins() });
})();

/////////////////// END OF - [jQuery] ///////////////////
/////////////////// START OF - [jQuery Plugins] ///////////////////

AN.init.addPlugins = function()
{
	//$.ajaxSetup({ cache: true });

/*
	$.getScript('http://jquery-ui.googlecode.com/svn/tags/1.6rc2/ui/ui.core.min.js', function()
	{
		$.getScript('http://jquery-ui.googlecode.com/svn/tags/1.6rc2/ui/ui.colorpicker.min.js');
	});
*/

	// (v)sprintf by Sabin Iacob
	(function(){
		var formats = {
			'%': function(val) {return '%';},
			'b': function(val) {return  parseInt(val, 10).toString(2);},
			'c': function(val) {return  String.fromCharCode(parseInt(val, 10));},
			'd': function(val) {return  parseInt(val, 10) ? parseInt(val, 10) : 0;},
			'u': function(val) {return  Math.abs(val);},
			'f': function(val, p) {return  (p > -1) ? Math.round(parseFloat(val) * Math.pow(10, p)) / Math.pow(10, p): parseFloat(val);},
			'o': function(val) {return  parseInt(val, 10).toString(8);},
			's': function(val) {return  val;},
			'x': function(val) {return  ('' + parseInt(val, 10).toString(16)).toLowerCase();},
			'X': function(val) {return  ('' + parseInt(val, 10).toString(16)).toUpperCase();}
		};

		var re = /%(?:(\d+)?(?:\.(\d+))?|\(([^)]+)\))([%bcdufosxX])/g;

		var dispatch = function(data){
			if(data.length == 1 && typeof data[0] == 'object') { //python-style printf
				data = data[0];
				return function(match, w, p, lbl, fmt, off, str) {
					return formats[fmt](data[lbl]);
				};
			} else { // regular, somewhat incomplete, printf
				var idx = 0; // oh, the beauty of closures :D
				return function(match, w, p, lbl, fmt, off, str) {
					return formats[fmt](data[idx++], p);
				};
			}
		};

		$.extend({
			sprintf: function(format) {
				var argv = Array.apply(null, arguments).slice(1);
				return format.replace(re, dispatch(argv));
			},
			vsprintf: function(format, data) {
				return format.replace(re, dispatch(data));
			}
		});
	})();

	AN.init.extend();
}

/////////////////// END OF - [jQuery Plugins] ///////////////////
/////////////////// START OF - [jQuery Extension] ///////////////////

AN.init.extend = function()
{
	$.fn.extend(
	{
		fn: function(fnToCall)
		{
			return fnToCall.call(this);
		},

		outer: function()
		{
			if(this.get(0).outerHTML) return this.get(0).outerHTML;
			else return $('<div />').append(this.eq(0).clone()).html();
		},

		alert: function(strToEval)
		{
			alert(eval('(' + strToEval + ')'));
			return this;
		},

		aO: function()
		{
			alert(this.outer());
			return this;
		},

		aL: function()
		{
			alert(this.length);
			return this;
		}
	});

	$.extend(
	{
		time: function()
		{
			return (new Date()).getTime();
		},

		convertObj: function(objToConvert)
		{
			if(!objToConvert)
			{
				return null;
			}
			else if(objToConvert.constructor == Object)
			{
				var arrTemp = [];
				$.each(objToConvert, function(strObjName, strValue)
				{
					arrTemp.push(strObjName + ':' + strValue);
				});
				return arrTemp;
			}
			else // Array
			{
				var objTemp = {};
				$.each(objToConvert, function(i, strValue)
				{
					var arrSplit = strValue.split(':');
					if(!isNaN(arrSplit[1]))
					{
						objTemp[arrSplit[0]] = Number(arrSplit[1]);
					}
					else
					{
						objTemp[arrSplit[0]] = arrSplit[1];
					}
				});
				return objTemp;
			}
		},

		getData: function(strUrl, funToCall)
		{
			var strDataName = strUrl.match(/[^\/.]+(?=\.[^\/.]+$)/)[0];

			$.getScript(strUrl, function()
			{
				funToCall(AN.data[strDataName]);
				delete AN.data[strDataName];
			});
		}
	});

	AN.init.loadData();
}

/////////////////// END OF - [jQuery Extension] ///////////////////
/////////////////// START OF - [Initialization] ///////////////////

AN.init.loadData = function()
{
	AN.data =
	{
		settings1: $.convertObj(AN.util.cookie('AN_settings1')) || {},
		settings2: $.convertObj(AN.util.cookie('AN_settings2')) || {},
		strCurPage: ($('#aspnetForm').get(0)) ? $('#aspnetForm').attr('action').match(/[^.]+/).toString().toLowerCase() : 'special'
	};

	$.each(AN.main, function()
	{
		for(var i in this.page)
		{
			if(AN.data.settings1[this.page[i] + this.id] === undefined)
			{
				AN.data.settings1[this.page[i] + this.id] = this.defaultOn;
			}
		}

		if(!this.options) return; // continue

		$.each(this.options, function(strOptionName)
		{
			if(AN.data.settings2[strOptionName] === undefined)
			{
				AN.data.settings2[strOptionName] = this.defaultValue;
			}
		});
	});

	AN.init.start(true);
}

AN.init.start = function(booIsFirstTime)
{
	AN.temp = {};
	AN.data.benchmark = [];

	if(AN.data.strCurPage != 'special' && booIsFirstTime)
	{
		$.each(AN.comp, function(strFnName)
		{
			if(this.page[0] == 'all' || $.inArray(AN.data.strCurPage, this.page) != -1)
			{
				var numTime = $.time();
				this.fn();
				AN.data.benchmark.push([strFnName, ($.time() - numTime)]);
			}
		});
	}

	$.each(AN.main, function()
	{
		if(AN.data.settings1['all' + this.id] || AN.data.settings1[AN.data.strCurPage + this.id])
		{
			if(booIsFirstTime || this.rerunnable)
			{
				//AN.shared.log('Begin: ' + this.disp + '...');
				var numTime = $.time();
				if(booIsFirstTime && this.once) this.once();
				this.fn();
				AN.data.benchmark.push([this.disp, ($.time() - numTime)]);
				//AN.shared.log('End: ' + this.disp + '.');
			}
		}
	});
}

/////////////////// END OF - [Initialization] ///////////////////
/////////////////// START OF - [Utility Functions] ///////////////////

AN.util =
{
	cookie: function(strName, objValue)
	{
		// GET
		if(objValue === undefined)
		{
			var numStart = document.cookie.indexOf(strName + '=');
			if(numStart == -1) return null;

			numStart += strName.length + 1;

			var numEnd = document.cookie.indexOf(';', numStart);
			if(numEnd == -1) numEnd = document.cookie.length;

			var strValue = document.cookie.substring(numStart,numEnd);

			if(strValue.indexOf(',') > 0) // Array
			{
				var arrValue = strValue.split(',');
				$.each(arrValue, function(i)
				{
					arrValue[i] = unescape(arrValue[i]);
				});
				return arrValue;
			}
			return unescape(strValue);
		}
		// SET
		else if(objValue)
		{
			if(objValue.constructor == Object) // convert it to an array
			{
				objValue = $.convertObj(objValue);
			}

			if(objValue.constructor == String)
			{
				var strValueToSave = escape(objValue);
			}
			else // Array
			{
				$.each(objValue, function(i)
				{
					objValue[i] = escape(objValue[i]);
				});
				var strValueToSave = objValue.toString();
			}

			var datExpire = new Date();
			datExpire.setFullYear(datExpire.getFullYear() + 1);

			document.cookie = strName + '=' + strValueToSave + '; domain=hkgolden.com; expires=' + datExpire.toUTCString() + '; path=/';
		}
		// DEL
		else
		{
			if(document.cookie.indexOf(strName + '=') == -1) return null;

			var datExpire = new Date();
			datExpire.setFullYear(1999);

			document.cookie = strName + '=xxx; domain=hkgolden.com; expires=' + datExpire.toUTCString() + '; path=/';
		}
	}
}

/////////////////// END OF - [Utility Functions] ///////////////////
/////////////////// START OF - [Shared Functions] ///////////////////

AN.shared =
{
	addStyle: function(strStyle)
	{
		$('<style type="text/css">' + strStyle + '</style>').prependTo('head');
	},

	getOption: function(strOptionName)
	{
		var objOptionValue = AN.data.settings2[strOptionName];

		if(objOptionValue == 'true')
		{
			return true;
		}
		else if(objOptionValue == 'false')
		{
			return false;
		}
		else if(!isNaN(objOptionValue))
		{
			return Number(objOptionValue);
		}
		else
		{
			return objOptionValue;
		}
	},

	getReplys: function()
	{
		if(AN.temp.arrReplys) return AN.temp.arrReplys;

		AN.temp.arrReplys = [];

		$('.repliers')
		.each(function()
		{
			var objReply =
			{
				strUserId: $(this).find('a:first').attr('href').replace(/^[^=]+=/, ''),
				strUserName: $(this).find('a:first').html(),
				$tdContent: $(this).find('table:last td:first')
			}
			AN.temp.arrReplys.push(objReply);
		});
		return AN.temp.arrReplys;
	},

	getTopicRows: function()
	{
		if(AN.temp.arrTopicRows) return AN.temp.arrTopicRows;

		AN.temp.arrTopicRows = [];

		$('td').each(function()
		{
			if($(this).html().match(/^\s*最後回應時間$/))
			{
				$.each($(this).parent().nextAll('tr'), function()
				{
					var objRow =
					{
						$trTopicRow: $(this),
						strLinkId: $(this).find('a:first').attr('href').match(/\d+$/)[0],
						strUserName: $(this).find('a:last').html()
					}
					AN.temp.arrTopicRows.push(objRow);
				});
				return false; // break;
			}
		});
		return AN.temp.arrTopicRows;
	},

	getCurPageNo: function()
	{
		return Number($('select[name=page]:first > :selected').val());
	},

	isLoggedIn: function()
	{
		if(AN.data.booIsLoggedIn) return AN.data.booIsLoggedIn;

		return AN.booIsLoggedIn = ($('#ctl00_ContentPlaceHolder1_lb_UserName a:first').attr('href').indexOf('login.aspx') == -1);
	}
}

/////////////////// END OF - [Shared Functions] ///////////////////
/////////////////// START OF - [Compulsory Functions] ///////////////////

AN.comp =
{
	addMainStyle:
	{
		page: ['all'],
		fn: function()
		{
			AN.shared.addStyle(' \
			#AN_divLeft { position: fixed; top: 50%; left: 0; text-align: right; } \
			#AN_divRight { position: fixed; top: 15%; right: 0; text-align: left; } \
			#AN_divLeft div { border: 0 solid gray; padding: 5px 0; } \
			#AN_divLeftMiddle { display: none; border-width: 1px 0 !important; } \
			#AN_divRight div { border-bottom: 1px solid gray; padding: 10px 5px 3px 0; } \
			#AN_divLeft div, #AN_divRight div { width: 80px; color: gray; cursor: pointer; } \
			#AN_divLeft div:hover, #AN_divRight div:hover { color: YellowGreen; } \
			#AN_divLeft a, #AN_divRight a { color: gray; text-decoration: none; } \
			#AN_divLeft a:hover, #AN_divRight a:hover { color: YellowGreen; } \
			\
			.AN_inlineBox { display: inline-block; color: gray; border: 1px solid gray; padding: 1px 2px; } \
			.AN_spanLine { color: gray; border-bottom: 1px solid dotted; } \
			#AN_divAlertBox { display: none; position: absolute; background-color: white; color: red; border: 1px solid red; padding: 1px 2px; } \
			\
			#AN_divGrayLayer { display: none; z-index: 1; position: fixed; left: 0; top: 0; width: 100%; height: 100%; background-color: gray; opacity: 0.7; filter: alpha(opacity=70); } \
			#AN_divSettingsFrame { display: none; z-index: 2; position: fixed; top: 50%; left: 50%; width: 800px; height: 600px; margin: -300px 0 0 -400px; background-color: #F3F2F1; border: 1px solid black; } \
			#AN_divAccordion { overflow: hidden; height: 550px; border-bottom: 1px solid black; } \
			#AN_divAccordion h3 { line-height: 25px; height: 25px; margin: 0; padding: 0 5px; background-color: #336699; border-top: 1px solid black; color: white; cursor: pointer; } \
			#AN_divAccordion div { padding: 10px 20px 0; border-top: 1px solid black; overflow: auto; } \
			#AN_divAccordion ul { list-style: none; } \
			#AN_divAccordion li { margin-bottom: 5px; } \
			#AN_divAccordion fieldset { margin-bottom: 10px; } \
			#AN_divOkButton, #AN_divCancelButton { position: absolute; width: 100px; height: 25px; bottom: 12.5px; border: 1px solid black; line-height: 25px; text-align: center; cursor: pointer; } \
			#AN_divOkButton { left: 280px; } \
			#AN_divCancelButton { right: 280px; } \
			');
		}
	},

	addLeftRightDiv:
	{
		page: ['all'],
		fn: function()
		{
			$('body').append('<div id="AN_divLeft"><div id="AN_divLeftMiddle" /></div><div id="AN_divRight" />');
		}
	},

	addSettings:
	{
		page: ['all'],
		fn: function()
		{
			$('<div>Settings</div>').appendTo('#AN_divRight').click(function()
			{
				$('html').css('overflow', 'hidden');
				$('#AN_divGrayLayer').show().fadeTo('slow', 0.7);
				$('#AN_divSettingsFrame').fadeIn('slow');
			});

			$('body')
			.append('<div id="AN_divGrayLayer" />')
			.append('<div id="AN_divSettingsFrame"><div id="AN_divAccordion" /><div id="AN_divFinishButtons" /></div>');

			AN.data.settingsStructure = {};

			var objPageMap =
			{
				all: '全局設定',
				topics: '標題頁',
				view: '帖子頁',
				profilepage: '用戶資料頁',
				search: '搜尋頁',
				newmessages: '最新貼文頁',
				'default': '主論壇頁',
				special: '特殊頁'
			}

			var objTypeMap =
			{
				1: '原創功能',
				2: '優化、修正原有功能',
				3: '加入物件',
				4: '移除物件',
				5: '美化頁面',
				6: '其他'
			}

			$.each(objPageMap, function(strPageName)
			{
				AN.data.settingsStructure[strPageName] = {};
				$.each(objTypeMap, function(strTypeId)
				{
					AN.data.settingsStructure[strPageName][strTypeId] = {};
				});
			});

			$.each(AN.main, function()
			{
				for(var i in this.page)
				{
					AN.data.settingsStructure[this.page[i]][this.type][this.id] =
					{
						disp: this.disp,
						options: this.options
					}
				}
			});

			$.each(AN.data.settingsStructure, function(strPageName)
			{
				var arrDivHTML = ['<div id="AN_div_' + strPageName + '">'];
				$.each(this, function(strType)
				{
					var num = 0; for(var i in this) num++; if(num == 0) return; // any better way to do this?

					arrDivHTML.push($.sprintf('<fieldset><legend>%s</legend><ul>', objTypeMap[strType]));
					$.each(this, function(strFnId)
					{
						var strSwitchId = 'AN_switch_' + strFnId;
						var strChecked = (AN.data.settings1[strPageName + strFnId]) ? 'checked="checked"' : '';

						arrDivHTML.push($.sprintf('<li><input class="AN_switch" type="checkbox" id="%s" %s />', strSwitchId, strChecked));
						arrDivHTML.push($.sprintf('<label for="%s">%s</label>', strSwitchId, this.disp));

						if(this.options)
						{
							arrDivHTML.push('&nbsp;&nbsp;&nbsp;[&nbsp;');

							$.each(this.options, function(strOptionName)
							{
								var strOptionId = 'AN_option_' + strOptionName;
								if(this.type == 'boolean')
								{
									var strOptionValue = (AN.data.settings2[strOptionName].toString() == 'true') ? 'checked="checked"' : '';

									arrDivHTML.push($.sprintf('<input class="AN_option" type="checkbox" id="%s" %s />', strOptionId, strOptionValue));
									arrDivHTML.push($.sprintf('<label for="%s">%s</label>&nbsp;', strOptionId, this.disp));
								}
								else if(this.type == 'string')
								{
									var strOptionValue = AN.data.settings2[strOptionName];
									arrDivHTML.push($.sprintf('%s: <input class="AN_option" type="text" id="%s" value="%s" />&nbsp;', this.disp, strOptionId, strOptionValue));
								}
							});

							arrDivHTML.push(']</li>');
						}

					});
					arrDivHTML.push('</ul></fieldset>');
				});
				arrDivHTML.push('</div>');

				$('#AN_divAccordion')
				.append('<h3>' + objPageMap[strPageName] + '</h3>')
				.append(arrDivHTML.join(''))
			});

			$('#AN_divAccordion')
			.append('<h3>其他選項</h3><div><ul /></div>')
			.children('h3:first').css('borderTop', '0')
			.fn(function()
			{
				this.siblings('div').height(550 - 10 - (25 + 1) * this.siblings('h3').andSelf().length);
				return this;
			})
			.end()
			.children('div:gt(0)').hide()
			.end()
			.children('h3').click(function()
			{
				$(this).next(':hidden').slideDown('slow').siblings('div:visible').slideUp('slow');
			});

			$('#AN_divFinishButtons')
			.append('<div id="AN_divOkButton">確定</div><div id="AN_divCancelButton">取消</div>')
			.children(':first-child').click(function()
			{
				var objSettings1 = {};

				$('#AN_divAccordion > div').each(function()
				{
					var strPageId = this.id.replace(/AN_div_/, '');

					$.each($(this).find('.AN_switch'), function()
					{
						objSettings1[strPageId + this.id.replace('AN_switch_', '')] = (this.checked) ? 1 : 0;
					});
				});
				AN.util.cookie('AN_settings1', objSettings1);

				var objSettings2 = {};

				$('#AN_divAccordion .AN_option').each(function()
				{
					var objOptionMap =
					{
						checkbox: this.checked,
						text: this.value
					}
					objSettings2[this.id.replace('AN_option_', '')] = objOptionMap[this.type];
				});
				AN.util.cookie('AN_settings2', objSettings2);

				location.reload();
			})
			.next().click(function()
			{
				$('html').css('overflow', '');
				$('#AN_divGrayLayer').fadeOut('slow');
				$('#AN_divSettingsFrame').fadeOut('slow');
			});
		}
	},

	addBenchmarkResult:
	{
		page: ['all'],
		fn: function()
		{
			$('<div>Benchmark</div>').appendTo('#AN_divRight').click(function()
			{
				alert(AN.data.benchmark);
			});
		}
	},

	addDebug:
	{
		page: ['all'],
		fn: function()
		{
			$('<div>Debug</div>').appendTo('#AN_divRight').click(function()
			{
				$('#AN_divDebug').fn(function()
				{
					this.is(':hidden') ? this.fadeIn('fast') : this.fadeOut('slow');
				});
			});

			AN.shared.log = function(strLog)
			{
				$('#AN_divDebug:hidden').fadeIn('fast');
				$('<div class="divLog">' + strLog + '</div>').prependTo('#AN_divDebugContent').slideDown('slow');
			}

			$.fn.log = function(strToEval)
			{
				AN.shared.log('debug: ' + eval('(' + strToEval + ')'));
				return this;
			}

			AN.shared.addStyle(' \
			#AN_divDebug { display: none; width: 200px; height: 300px; position: fixed; bottom: 0; right: 0; font-size: 10px; color: gray; overflow: hidden; } \
			#AN_divDebugHeader { border-bottom: 1px solid gray; font-weight: bold; padding-bottom: 3px; } \
			.divLog { display: none; border-bottom: 1px dotted gray; padding: 5px 5px 5px 0; } \
			')

			$('<div id="AN_divDebug"><div id="AN_divDebugHeader">Log</div><div id="AN_divDebugContent" /></div>').appendTo('body');
		}
	},

	addAbout:
	{
		page: ['all'],
		fn: function()
		{
			$('<div>About</div>').appendTo('#AN_divRight').click(function()
			{
				alert('Helianthus.Annuus\nversion: 2.x.x_alpha\nauthor: 向日');
			});
		}
	},

	convertData:
	{
		page: ['view'],
		fn: function()
		{
			var arrMatch;

			$.each(AN.shared.getReplys(), function(i, objReply)
			{
				if(objReply.strUserId == '148720') // me :P
				{
					objReply.$tdContent.find('a').each(function(i, nodA)
					{
						if(nodA.href.indexOf('http://helianthus-annuus.googlecode.com/svn/data/') >= 0)
						{
							$.getData(nodA.href, function(strHTML)
							{
								$(nodA).replaceWith(strHTML);
							});
						}
					});
				}
			});
		}
	}
}

/////////////////// END OF - [Compulsory Functions] ///////////////////
/////////////////// START OF - [Main Functions] ///////////////////

AN.main =
{
	autoRedirect:
	{
		disp: '自動轉向正確頁面',
		type: 6,
		page: ['default'],
		defaultOn: true,
		id: 1,
		rerunnable: false,
		fn: function()
		{
			if(document.referrer.indexOf('/login.aspx') > 0) location.replace('/topics.aspx?type=BW');
			else if(!location.pathname.match(/^\/(?:default.aspx)?$/i)) location.replace(location.href); // not using location.reload() because an error would occur on IE 7
		}
	},

	removeLeftArticles:
	{
		disp: '移除左側最近刊登的文章',
		type: 4,
		page: ['all'],
		defaultOn: true,
		id: 2,
		rerunnable: false,
		fn: function()
		{
			$('td').each(function()
			{
				//if($(this).html() == '最近刊登的文章')
				if($(this).css('fontWeight') == 'bold' && $(this).css('fontSize') == '8pt')
				{
					$(this).parents('tr:eq(1)').remove();
					return false; // break;
				}
			});
		}
	},

	optimiseForumLinks:
	{
		disp: '美化論壇連結',
		type: 5,
		page: ['all'],
		defaultOn: true,
		id: 3,
		rerunnable: true,
		options: { strLinkColor: { disp: '連結顏色(#RRGGBB)', defaultValue: '#1066d2', type: 'string' } }, // to be improved
		once: function()
		{
			var strLinkColor = AN.shared.getOption('strLinkColor');
			AN.shared.addStyle(' \
			a:link { color: ' + strLinkColor + '} \
			.aForumLink { text-decoration: none; } \
			');
		},
		fn: function()
		{
			var strLinkColor = AN.shared.getOption('strLinkColor');

			$('a').filter(function()
			{
				return (this.href.match(/javascript:|^http:\/\/forum\d+\.hkgolden\.com/i) && this.className.indexOf('AN_') == -1);
			})
			.addClass('aForumLink')
			.filter(function()
			{
				return (this.href.match(/javascript:|(?:blog|default|newmessages|topics)\.aspx/i) && !this.href.match(/redhotpage=|fanti=/i));
			})
			.add('#ctl00_ContentPlaceHolder1_lb_UserName > a')
			.css('color', strLinkColor);

			$('#ctl00_ContentPlaceHolder1_lb_bloglink span').css('text-decoration', 'none');
		}
	},

	removeRedHotRanking:
	{
		disp: '移除紅人榜',
		type: 4,
		page: ['topics'],
		defaultOn: false,
		id: 4,
		rerunnable: false,
		fn: function()
		{
			$('#ctl00_ContentPlaceHolder1_HotPeoples').prev().andSelf().remove();
		}
	},

	useBetterFavicon:
	{
		disp: '採用更好的favicon (may not work)',
		type: 5,
		page: ['all'],
		defaultOn: true,
		id: 5,
		rerunnable: false,
		fn: function()
		{
			$('head').append('<link rel="shortcut icon" href="http://helianthus-annuus.googlecode.com/files/hkg.ico" />');
		}
	},

	optimisePageLinks:
	{
		disp: '優化上下頁連結地址',
		type: 2,
		page: ['view'],
		defaultOn: true,
		id: 6,
		rerunnable: true,
		fn: function()
		{
			$('a[href*=&highlight_id=0]').each(function()
			{
				this.href = $(this).attr('href').replace(/&highlight_id=0/i, '') // using jQuery to fix an IE 7 bug
			});
		}
	},

	removeRedHotRecord:
	{
		disp: '移除紅人榜記錄',
		type: 4,
		page: ['profilepage'],
		defaultOn: false,
		id: 7,
		rerunnable: false,
		fn: function()
		{
			$('#ctl00_ContentPlaceHolder1_HotPeoples').next().andSelf().remove();
		}
	},

	searchOnNewPage:
	{
		disp: '搜尋開新頁',
		type: 2,
		page: ['topics', 'search', 'newmessages'],
		defaultOn: true,
		id: 8,
		rerunnable: false,
		fn: function()
		{
			$window.Search = function()
			{
				var strType = $('#st option:selected').val();
				window.open('search.aspx?st=' + strType + '&searchstring=' + escape($('#searchstring').val()), '_blank');
				$('#searchstring').val('');
			}
		}
	},

	fixSearchLink:
	{
		disp: '修正會員文章搜尋連結',
		type: 2,
		page: ['topics', 'search', 'newmessages', 'profilepage'],
		defaultOn: true,
		id: 9,
		rerunnable: true,
		fn: function()
		{
			$.each(AN.shared.getTopicRows(), function()
			{
				this.$trTopicRow.find('a:last').attr('href', '/search.aspx?st=A&searchstring=' + escape(this.strUserName));
			});
		}
	},

	changeQuoteStyle:
	{
		disp: '改變引用風格',
		type: 1,
		page: ['view'],
		defaultOn: false,
		id: 10,
		rerunnable: true,
		options: { booOuterOnly: { disp: '只顯示最外層的引用', defaultValue: true, type: 'boolean' } },
		once: function()
		{
			AN.func.toggleAllQuotes = function(nodB)
			{
				var booShow = (nodB) ? ($(nodB).next().html() == '+') : false;
				$('.AN_outermostFirstB').next().each(function(){ AN.func.toggleThisQuote({ nodB: this, booShow: booShow }) });
			}

			AN.func.toggleThisQuote = function(objData)
			{
				$b = $(objData.nodB);
				var $divToToggle = $b.parents('blockquote:first').find('blockquote:first');

				var booShow = (objData.booShow === undefined) ? ($b.html() == '+') : objData.booShow;

				if(booShow)
				{
					$divToToggle.show();
					$b.html('-');
					$b.parents('div:first').css('marginBottom', '2px');
				}
				else
				{
					$divToToggle.hide();
					$b.html('+');
					$b.parents('div:first').css('marginBottom', '5px');
				}
			}

			AN.shared.addStyle(' \
			blockquote { margin: 5px 0 5px 0; border: 1px solid black; } \
			blockquote blockquote { margin-top: 0; border-right: 0; } \
			blockquote div { padding: 0 0 5px 2px; } \
			.AN_quoteHeader { padding: 0 0 0 3px; color: white; font-size: 12px; background-color: #336699; border-bottom: 1px solid black; margin-bottom: 2px; } \
			.AN_quoteHeader span { display: inline-block; width: 49.8%; } \
			.AN_quoteHeader b { font-family: "Courier New"; cursor: pointer; margin-right: 3px; } \
			');
		},
		fn: function()
		{
			$('blockquote').each(function()
			{
				$quote = $(this);

				if($quote.children().children('blockquote:only-child').length) // has inner quotes, is aempty quote
				{
					$quote.replaceWith($quote.children().children().get(0));
					return;
				}

				while(this.nextSibling && this.nextSibling.nodeName.toLowerCase() == 'br') $quote.next().remove();

				$quote.prepend('<div class="AN_quoteHeader"><span>引用:</span><span style="text-align:right"><b title="Toggle all outermost quotes" style="display:none" onclick="AN.func.toggleAllQuotes(this)">O</b><b style="Toggle this" onclick="AN.func.toggleThisQuote({nodB:this})">-</b></span>');

				if(!$quote.find('blockquote').length) // innermost or single-layer
				{
					$quote.find('b:last').css('visibility', 'hidden');
				}
				if(!$quote.parent('div').length) // outermost
				{
					$quote.find('b:first').show().addClass('AN_outermostFirstB')
				}
			});

			if(AN.shared.getOption('booOuterOnly')) AN.func.toggleAllQuotes();
		}
	},

	optimiseImageResizing:
	{
		disp: '優化圖片縮放',
		type: 2,
		page: ['view'],
		defaultOn: true,
		id: 11,
		rerunnable: false,
		options:
		{
			numImageWidth: { disp: '最大闊度', defaultValue: 600, type: 'string' },
			numMaxRatio: { disp: '最大長闊比例(1:X)', defaultValue: 7, type: 'string' }
		},
		once: function()
		{
			$window.DrawImage = function(nodImg)
			{
				var numParentWidth = $(nodImg.offsetParent).width();
				if(numParentWidth == 0) return; // for ajax

				nodImg.setAttribute('onload','');
				nodImg.alt = '[AN]DEADIMAGE'; // old: for FF3, no spaces due to strange bug on message=1153683&page=4 with forceOneImagePerLine switched on

				var imgTemp = new Image();
				imgTemp.src = nodImg.src;
				if(!imgTemp.width) return; //  for FF3

				try // old: FF3 bug? message=1352216 & IE7 bug? message=1360706
				{
					var numMaxWidth = AN.shared.getOption('numImageWidth');
					var numMaxWidthAllowed = numParentWidth - nodImg.offsetLeft - 5;
					if(numMaxWidth > numMaxWidthAllowed) numMaxWidth = numMaxWidthAllowed;
				}
				catch(err)
				{
					var numMaxWidth = 300;
				}
				var numFixedHeight = Math.round(imgTemp.height * numMaxWidth / imgTemp.width);

				if(imgTemp.width > 99) nodImg.style.display = 'block';

				if(imgTemp.height / imgTemp.width > AN.shared.getOption('numMaxRatio'))
				{
					nodImg.width = 30;
					nodImg.height = 30;
					$(nodImg).parent().after($.sprintf('<span class="AN_spanLine">圖片長闊比例 &gt; %s, 金鋼棒已被壓成廢鐵!</span>', AN.shared.getOption('numMaxRatio')));
					return;
				}
				else if(imgTemp.width <= numMaxWidth) // && imgTemp.height <= numMaxHeight)
				{
					nodImg.width = imgTemp.width;
					nodImg.height = imgTemp.height;
					nodImg.title = '[AN] ori:' + imgTemp.width + 'x' + imgTemp.height + ' now: the same';
					return;
				}
				else // if(numFixedWidth >= numMaxWidth)
				{
					nodImg.width = numMaxWidth;
					nodImg.height = numFixedHeight;
				}
				nodImg.title = '[AN] ori:' + imgTemp.width + 'x' + imgTemp.height + ' now:' + nodImg.width + 'x' + nodImg.height;
			}
		},
		fn: function()
		{
			$.each(AN.shared.getReplys(), function()
			{
				this.$tdContent.find('img').each(function()
				{
					if(this.complete && this.getAttribute('onload')) $window.DrawImage(this);
				});
			});
		}
	},

	addQuickLinkToTopicsPage:
	{
		disp: '加入前往吹水台的快速連結',
		type: 3,
		page: ['all'],
		defaultOn: true,
		id: 12,
		rerunnable: false,
		fn: function()
		{
			$('#AN_divLeft')
			.find('#AN_divLeftMiddle').show().append('<a class="AN_special" href="/topics.aspx?type=BW">Topics</a>')
			.end().fn(function()
			{
				this.css('margin-top', -(this.outerHeight() / 2));
			});
		}
	},

	addGoToLinks:
	{
		disp: '加入前往最頂/底的按扭',
		type: 3,
		page: ['view'],
		defaultOn: true,
		id: 13,
		rerunnable: false,
		fn: function()
		{
			$('#AN_divLeft')
			.prepend('<div onclick="scrollTo(0,0)">Top</div>')
			.append('<div onclick="scrollTo(0,99999)">Bottom</div>')
			.fn(function()
			{
				if($('#AN_divLeftMiddle:hidden').length) this.children(':first').css('border-bottom-width', '1px');
				this.css('margin-top', -(this.outerHeight() / 2));
			});
		}
	},

	changeQuickReplyStyle:
	{
		disp: '改變快速回覆的風格',
		type: 1,
		page: ['view'],
		defaultOn: false,
		id: 14,
		rerunnable: false,
		fn: function()
		{
			if(!AN.shared.isLoggedIn()) return;

			var $divQR = $('#newmessage');

			$divQR
			.prevAll('br:lt(2)').remove()
			.end()
			.find('table:eq(2) tr:lt(2)').hide()
			.end()
			.css(
			{
				position: 'fixed',
				width: '806px',
				filter: 'alpha(opacity=70)',
				opacity: '0.7',
				left: ($('html').outerWidth() - $divQR.outerWidth()) / 2 + 'px',
				bottom: '0'
			})
			.find('tr:eq(2)').attr('id', 'AN_divToToggle').hide()
			.end()
			.find('td:eq(1)')
			.text('點擊顯示/隱藏快速回覆')
			.css({ textAlign: 'center', cursor: 'pointer' })
			.click(function(){ $('#AN_divToToggle').toggle(); });

			//$('#ctl00_ContentPlaceHolder1_messagetext').css('max-width', '95%');

			$window.OnQuoteSucceeded = function(result)
			{
				$('#ctl00_ContentPlaceHolder1_messagetext').val(unescape(result) + '\n');
				$('#AN_divToToggle:hidden').show();
			}
		}
	},

	convertSmileys:
	{
		disp: '轉換表情碼為圖片',
		type: 1,
		page: ['topics', 'search', 'newmessages', 'profilepage'],
		defaultOn: true,
		id: 15,
		rerunnable: true,
		fn: function()
		{
			var regSmiley = /([#[](hehe|love|ass|sosad|good|hoho|kill|bye|adore|banghead|bouncer|bouncy|censored|flowerface|shocking|photo|fire|yipes|369|bomb|slick|no|kill2|offtopic)[\]#])/g;

			var arrConvertMap =
			[
				{ regex: /(O:-\))/g, result: 'angel' },
				{ regex: /(xx\()/g, result: 'dead' },
				{ regex: /(:\))/g, result: 'smile' },
				{ regex: /(:o\))/g, result: 'clown' },
				{ regex: /(:-\()/g, result: 'frown' },
				{ regex: /(:~\()/g, result: 'cry' },
				{ regex: /(;-\))/g, result: 'wink' },
				{ regex: /(:-\[)/g, result: 'angry' },
				{ regex: /(:-])/g, result: 'devil' },
				{ regex: /(:D)/g, result: 'biggrin' },
				{ regex: /(:O)/g, result: 'oh' },
				{ regex: /(:P)/g, result: 'tongue' },
				{ regex: /(^3^)/g, result: 'kiss' },
				{ regex: /(\?_\?)/g, result: 'wonder' },
				{ regex: /(#yup#)/g, result: 'agree' },
				{ regex: /(#ng#)/g, result: 'donno' },
				{ regex: /(#oh#)/g, result: 'surprise' },
				{ regex: /(#cn#)/g, result: 'chicken' },
				{ regex: /(Z_Z)/g, result: 'z' },
				{ regex: /(@_@)/g, result: '@' },
				{ regex: /(\?\?\?)/g, result: 'wonder2' },
				{ regex: /(fuck)/g, result: 'fuck' }
			]

			$.each(AN.shared.getTopicRows(), function()
			{
				var $a = this.$trTopicRow.find('td:eq(1) a:first');
				var strTemp = $a.html();

				strTemp = strTemp.replace(regSmiley, '<img style="border-width:0px;vertical-align:middle" src="/faces/$2.gif" alt="$1" />');

				$.each(arrConvertMap, function()
				{
					strTemp = strTemp.replace(this.regex, '<img style="border-width:0px;vertical-align:middle" src="/faces/' + this.result + '.gif" alt="$1" />');
				});

				$a.html(strTemp);
			});
		}
	},

	removeForumList:
	{
		disp: '移除討論區選單',
		type: 4,
		page: ['topics', 'search', 'newmessages'],
		defaultOn: true,
		id: 16,
		rerunnable: false,
		fn: function()
		{
			$('#forum_list').parents('table:first').remove();
		}
	},

	optimiseSearchRow:
	{
		disp: '優化搜尋列',
		type: 2,
		page: ['topics', 'search', 'newmessages'],
		defaultOn: true,
		id: 17,
		rerunnable: false,
		fn: function()
		{
			$('#aspnetForm').css('margin', '0'); // for IE 7

			$('#searchstring').parents('td:first').fn(function()
			{
				this.css('text-align', 'right').find('img').css('vertical-align', 'bottom')

				if(this.find('p').length) this.get(0).innerHTML = this.find('p').html(); // topics & newmessages // we have a problem here on IE 7 becoz of form id=frmSearch
				else this.parent().next().remove(); // search
			});
		}
	},

	optimiseSelectBoxPosition:
	{
		disp: '修正下方選單位置 (IE Only)',
		type: 2,
		page: ['topics', 'search', 'newmessages'],
		defaultOn: false,
		id: 18,
		rerunnable: false,
		fn: function()
		{
			$('#filter').css({ position: 'relative', top: '9px' });
		}
	},

	addFloorNumber:
	{
		disp: '加入樓層編號',
		type: 3,
		page: ['view'],
		defaultOn: true,
		id: 19,
		rerunnable: true,
		fn: function()
		{
			var numPageNo = AN.shared.getCurPageNo();
			var numFloorNum = (numPageNo == 1) ? 0 : 50 * (numPageNo - 1) + 1;
			$('.repliers').each(function()
			{
				$(this).find('span:last').append($.sprintf(' <span class="AN_inlineBox">#%s</span>', numFloorNum++));
			});
		}
	},

	alertOnSuspiciousLinks:
	{
		disp: '提示可疑連結',
		type: 1,
		page: ['view'],
		defaultOn: true,
		id: 20,
		rerunnable: true,
		once: function()
		{
			$('body').append('<div id="AN_divAlertBox">test</div>');
		},
		fn: function()
		{
			$.each(AN.shared.getReplys(), function()
			{
				this.$tdContent.find('a').each(function()
				{
					if(this.href.match(/[?&](?:r(?:ef)?|uid)=|logout|shortlink|tinyurl|urlpire/i))
					{
						$(this).data('keyword', RegExp.lastMatch).hover(
							function()
							{
								var $this = $(this);
								$('#AN_divAlertBox')
								.css({ top: ($this.offset().top - $this.height() - 10), left: $this.offset().left })
								.text('發現可疑連結! keyword: ' + $this.data('keyword'))
								.fadeIn();
							},
							function()
							{
								$('#AN_divAlertBox').fadeOut();
							}
						);
					}
				});
			});
		}
	},

	enableWideScreen:
	{
		disp: '拉闊頁面',
		type: 1,
		page: ['all'],
		defaultOn: false,
		id: 21,
		rerunnable: false,
		fn: function()
		{
			if(!AN.data.strCurPage.match(/^(?:topics|view|search|newmessages|default)$/)) return;
			$('table,td').filter(function(){ return this.width.match(/^(?:955|937|806)$/); }).width('100%');
		}
	},

	removeDeadAvatar:
	{
		disp: '移除高級會員頭像死圖',
		type: 4,
		page: ['view'],
		defaultOn: true,
		id: 22,
		rerunnable: true,
		fn: function()
		{
			var booHasNaturalWidth = ((new Image()).naturalWidth == 0);

			$('img[alt=Logo]')
			.filter(function()
			{
				if(booHasNaturalWidth) return (this.naturalWidth == 0);
				else return !(this.complete);
			})
			.each(function()
			{
				$(this).parents('tr:first').remove();
			});
		}
	},

	removeMainBGTopRow:
	{
		disp: '移除繁簡轉換及分享這頁',
		type: 4,
		page: ['all'],
		defaultOn: false,
		id: 23,
		rerunnable: false,
		fn: function()
		{
			$('#ctl00_TraditionalLink').parents('td:eq(1)').html('&nbsp;');
		}
	},

	forceLineBreak:
	{
		disp: '強制換行',
		type: 1,
		page: ['view'],
		defaultOn: true,
		id: 24,
		rerunnable: true,
		fn: function()
		{
			$.each(AN.shared.getReplys(), function()
			{
				this.$tdContent.css({ wordWrap: 'break-word', overflow: 'hidden' }).parents('table:first').css('table-layout', 'fixed');
			});
		}
	},

	linkifyMatchedCharacters:
	{
		disp: '智能地將文字轉換成連結',
		type: 1,
		page: ['view'],
		defaultOn: true,
		id: 25,
		rerunnable: true,
		fn: function()
		{
			var regLink = /(?:(h\w{2}ps?[:\/]+?)|[\w-]+?@)?((?:(?:\d{1,3}\.){3}\d{1,3}|(?:[\w-]+?\.){0,4}[\w-]{2,}\.(?:biz|cn|cc|co(?=\.)|com|de|eu|gov|hk|info|jp(?!g)|net|org|ru|tk|us)(?:\.[a-z]{2,3})?)(?::\d{1,5})?(?:\/[\w~./%?&=#+:-]*)?)/i;

			var funWrap = function(nodToWrap)
			{
				nodToWrap.splitText(RegExp.leftContext.length + RegExp.lastMatch.length);
				nodToWrap = nodToWrap.splitText(RegExp.leftContext.length);

				var strHref = (RegExp.$1 || 'http://') + RegExp.$2;
				$(nodToWrap)
				.wrap($.sprintf('<a href="%s" />', strHref))
				.parent().before('<span style="cursor: default; color: gray; margin-right: 2px" title="Characters Linkified">[L]</span>');

				if(nodToWrap.nextSibling && nodToWrap.nextSibling.nodeValue.match(regLink)) funWrap(nodToWrap.nextSibling);
			}

			var funSearch = function(colNodeList)
			{
				$.each(colNodeList, function()
				{
					if(this.nodeType == 3 && this.nodeValue.match(regLink))
					{
						funWrap(this);
					}
					else if(!this.nodeName.match(/^(?:a|button|script|style)/i))
					{
						funSearch(this.childNodes);
					}
				});
			}

			$.each(AN.shared.getReplys(), function()
			{
				funSearch(this.$tdContent.get(0).childNodes);
			});
		}
	},

	convertLinksToCurrentServer:
	{
		disp: '轉換論壇連結的伺服器位置',
		type: 1,
		page: ['view'],
		defaultOn: true,
		id: 26,
		rerunnable: true,
		fn: function()
		{
			$.each(AN.shared.getReplys(), function()
			{
				this.$tdContent.find('a').each(function()
				{
					if(this.hostname.match(/forum\d*.hkgolden\.com/i) && this.firstChild.nodeName.toLowerCase() != 'img' && RegExp.lastMatch != location.hostname)
					{
						this.hostname = location.hostname;
						$(this).before('<span style="cursor: default; color: gray; margin-right: 2px" title="Server No. Converted">[C]</span>');
					}
				});
			});
		}
	},

	improveCompanyMode:
	{
		disp: '改進公司模式 (雖然還是沒甚麼用處)',
		type: 2,
		page: ['all'],
		defaultOn: true,
		id: 27,
		rerunnable: false,
		fn: function()
		{
			if(AN.util.cookie('companymode') == 'Y')
			{
				document.title = 'Google';
			}
		}
	},

	ajaxifyPageLoading:
	{
		disp: 'Ajax化頁面讀取',
		type: 1,
		page: ['view'],
		defaultOn: true,
		id: 28,
		rerunnable: false,
		fn: function()
		{
			AN.func.getURL = function(numPageNo)
			{
				return location.href.replace(/&page=\d+/, '') +  '&page=' + numPageNo;
			}

			AN.func.changeReplies = function($html, numPageNo)
			{
				AN.data.jPages[numPageNo] = $('<div />').append($html.find('select[name=page]:first').parents('table:eq(2)').prev().nextAll('table'));
				AN.data.jPages[AN.shared.getCurPageNo()].after(AN.data.jPages[numPageNo]).remove();
				AN.init.start(false);
			}

			AN.func.afterPageChanging = function(numCurPageNo)
			{
				AN.func.addEvents();
				scrollTo(0,0);
				AN.shared.log($.sprintf('Successfully changed to page %s.', numCurPageNo));
				AN.func.getPage(numCurPageNo + 1);
			}

			AN.func.goToPage = function(event, numPageNo)
			{
				event.preventDefault();

				AN.shared.log($.sprintf('Changing to page %s, please wait...', numPageNo));

				if(!AN.data.jPages[numPageNo])
				{
					if(AN.data.jCache[numPageNo])
					{
						AN.func.changeReplies(AN.data.jCache[numPageNo], numPageNo);
						AN.data.jCache[numPageNo] = null;
						AN.func.afterPageChanging(numPageNo);
					}
					else
					{
						$.get(AN.func.getURL(numPageNo), null, function(strHTML)
						{
							AN.func.changeReplies($(strHTML), numPageNo);
							AN.func.afterPageChanging(numPageNo);
						});
					}
				}
				else
				{
					AN.data.jPages[AN.shared.getCurPageNo()].after(AN.data.jPages[numPageNo]).remove();
					AN.func.afterPageChanging(numPageNo);
				}
			}

			$window.changePage = function(){};

			AN.func.addEvents = function()
			{
				$('select[name=page]').each(function()
				{
					$(this).parents('tr:first').find('a').click(function(event)
					{
						AN.func.goToPage(event, Number(this.href.match(/page=\d+/)[0].replace(/page=/,'')));
					})
					$(this).change(function(event)
					{
						var numSelected = Number($(this).children(':selected').val());
						var numCurPageNo = $('select[name=page]').not(this).children(':selected').val();
						$(this).children().eq(numCurPageNo - 1).attr('selected', true);
						AN.func.goToPage(event, numSelected);
					});
				});
			}

			/// cacheNextPage & autoAddReplies ///
			AN.func.getPage = function(numPageToGet)
			{
				var
				numRepliesLength = $('.repliers').length,
				numCurPageNo = AN.shared.getCurPageNo(),
				booIsRepliesMax = (numCurPageNo == 1) ? (numRepliesLength == 51) : (numRepliesLength == 50);

				if(!booIsRepliesMax)
				{
					var numCurPageNo = AN.shared.getCurPageNo();
					AN.shared.log('Querying lastest replies...');
					$.get(AN.func.getURL(numCurPageNo), null, function(strHTML)
					{
						var $html = $(strHTML);
						if($html.find('strong:first').text() != $('strong:first').text())
						{
							var $temp = $('<div />').append($html.find('select[name=page]:first').parents('table:eq(2)').prev().nextAll('table'));
							AN.data.jPages[numCurPageNo].after($temp).remove();
							AN.data.jPages[numCurPageNo] = $temp;

							AN.init.start(false);
							AN.shared.log('Lastest reply(s) are added, query again in 30s...');
						}
						else AN.shared.log('No new replies, query again in 30s...');
						setTimeout(function(){ AN.func.getPage(numPageToGet); }, 30000);
					});
				}
				else
				{
					if(numPageToGet == 21) return; // 1001
					if(AN.data.jPages[numPageToGet]) return AN.shared.log('Next page is already in cache, no caching needed.');
					AN.shared.log('Querying next page for caching...');
					$.get(AN.func.getURL(numPageToGet), null, function(strHTML)
					{
						AN.data.jCache[numPageToGet] = $(strHTML);
						AN.shared.log($.sprintf('Next page (%s) is cached.', numPageToGet));
					});
				}
			}

			var numCurPageNo = AN.shared.getCurPageNo();
			$.ajaxSetup({ cache: false });
			AN.data.jCache = {};
			AN.data.jPages = {};
			AN.data.jPages[numCurPageNo] = $('select[name=page]:first').parents('table:eq(2)').prev().nextAll('table').wrapAll('<div />').parent();
			AN.func.addEvents();
			setTimeout(function(){ AN.func.getPage(numCurPageNo + 1); }, 10000);
		}
	}
}

///////////// END OF - [Execute Fuctions] ///////////////////