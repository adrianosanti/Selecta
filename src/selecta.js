/*

	Selecta
	Responsive Select Dropdown Replacement

	Hat tip to lcdsantos for the idea.

	___________________________________________________

	USAGE

	$('.select-menu').Selecta({
		show: 5,
		keepOpen: false,
		nativeOnMobile: false
	});

	OPTIONS

	show (integer)

		Number of items to show upon opening the menu. Default is 5.

	keepOpen (boolean)

		Indicates whether menu should remain open after the user selects an item. Default is false.

	nativeOnMobile (boolean)

		Indicates whether native functionality should be used on mobile / touchscreen devices. Default is false.

	forceRenderBelow (boolean)

		Indicates whether dropdown should always render below the label. Default is false.

	validateOnSubmit (boolean)

		Indicates whether the element should be validated when its containing form is submitted. Default is false.

	firstAsPlaceholder (boolean)

		Indicates whether the script should take the first item in the dropdown as its placeholder (item becomes hidden and unselectable). Default is true.

	detectMobile (function)

		Provides a different function for detecting mobile devices (default is Modernizr.touchevents with a fallback to window.matchMedia).
		Function needs to return a boolean value (true/false) in order to work.

		Example:
			$('.select-menu').Selecta({
				nativeOnMobile: true,
				detectMobile: function() {
					return $('.element').hasClass('mobile');
				}
			});

	class (string)

		Additional class(es) to add to the container. Default is null.

*/

(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = function( root, jQuery ) {
			if ( jQuery === undefined ) {
				if ( typeof window !== 'undefined' ) {
					jQuery = require('jquery');
				} 
				else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} 
	else {
		factory(jQuery);
	}
}(function($) {
	'use strict';

	var _S = 'Selecta',
		$window = $(window);

	var Selecta = function(obj, params) {
		var S = this;

		S.$select = $(obj);
		S.props = {
			multi: ((typeof S.$select.attr('multiple')) !== 'undefined'),
			enabled: false,
			classes: ((typeof S.$select.attr('class')) !== 'undefined') ? S.$select.attr('class').split(' ') : false
		};

		S.triggers = {
			init: 'selecta-init',
			open: 'selecta-open',
			close: 'selecta-closed',
			change: 'selecta-change',
			populated: 'selecta-populated',
			refresh: 'selecta-refresh'
		};

		S.classes = {
			container: 'selecta',
			select: 'selecta-hidden',
			label: 'selecta-label',
			labelWrapper: 'selecta-label-wrapper',
			items: 'selecta-items',
			multi: 'selecta-multi',
			placeholder: 'selecta-placeholder',
			hover: 'selecta-hover',
			itemHover: 'highlighted',
			itemSelected: 'selected',
			above: 'above',
			open: 'selecta-open',
			native: 'selecta-native',
			optgroup: 'selecta-items-group',
			grouplabel: 'selecta-items-group-label',
			invalid: 'selecta-invalid'
		};

		S.init(params);
	};

	Selecta.prototype = {
		init: function(params) {
			var S = this;
			S.params = $.extend(true, {}, $.fn[_S].defaults, S.params, params);

			S.$select.addClass(S.classes.select).wrap(S.params.template.main);

			S.$container = S.$select.closest('.'+ S.classes.container);
			S.$label = S.$container.find('.'+ S.classes.label);
			S.$items = S.$container.find('.'+ S.classes.items);

			if (S.params.detectMobile) {
				S.props.mobile = S.params.detectMobile();
			}
			else {
				S.props.mobile = ((typeof Modernizr) === 'object' && Modernizr.touchevents) ? Modernizr.touchevents : ($window[0].matchMedia && $window[0].matchMedia('only screen and (max-width: 48rem)').matches) ? true : false;
			}

			if (S.props.multi) {
				S.$container.addClass(S.classes.multi);
			}

			if (S.params.firstAsPlaceholder) {
				S.$placeholder = S.$select.find('option').first();
				S.$placeholder.addClass(S.classes.placeholder);
			}
			else {
				S.$placeholder = S.$select.find('.'+ S.classes.placeholder);
			}

			if (S.params.class) {
				var currentClass = S.$container.attr('class');
				S.$container.addClass(currentClass +' '+ S.params.class);
			}

			if (S.props.classes) {
				S.$container.addClass('s-'+ S.props.classes[0]);
			}

			if (S.props.mobile && S.params.nativeOnMobile) {
				S.$container.addClass(S.classes.native);

				S.$select.on('change', function(e) {
					S.$select.trigger(S.triggers.change, S);
				});
			}

			S.$select.on('change '+ S.triggers.init +' '+ S.triggers.populated +' '+ S.triggers.refresh +' '+ S.triggers.change, function() {
				var strLabel = '',
					val = S.$select.val();

				S.$items.find('li').removeClass(S.classes.itemSelected);

				if (!val || val === '' || val == S.$placeholder.val()) {
					strLabel = $(S.params.template.placeholder).addClass(S.classes.labelWrapper).text(S.$placeholder.text())[0];
					S.$placeholder.attr('disabled', true);
				}
				else {
					if (S.props.multi) {
						var $labelContainer = $(S.params.template.label);

						$labelContainer.addClass(S.classes.labelWrapper);
						for (var i = 0; i < val.length; i++) {
							var $selected = S.$select.find('option[value="'+ val[i] +'"]'),
								$pill = $(S.params.template.pill).attr('data-value', val[i]).text($selected.text());

							$pill.one('click', function(e) {
								e.preventDefault();
								e.stopPropagation();
								S.deselect($(this).attr('data-value'));
							});

							$labelContainer.append($pill);
							S.$items.find('li[data-value="'+ val[i] +'"]').addClass(S.classes.itemSelected);
						}

						strLabel = $labelContainer;
					}
					else {
						var $selected = S.$select.find('option[value="'+ val +'"]');
						strLabel = $(S.params.template.label).addClass(S.classes.labelWrapper).text($selected.text());
						S.$items.find('li[data-value="'+ val +'"]').addClass(S.classes.itemSelected);
					}
				}
				S.writeLabel(strLabel);
			});

			S.$select.on(S.triggers.open, function() {
				var itemHeight = S.$items.find('li').first().outerHeight(),
					itemTotal = S.$items.find('li').length,
					itemLimit = S.params.show,
					containerTop = S.$container.offset().top - $window.scrollTop(),
					containerHeight = S.$container.innerHeight(),
					limY = $window.innerHeight();

				if (S.params.show > itemTotal) {
					itemLimit = itemTotal;
				}

				var maxHeight = itemLimit * itemHeight,
					itemBot = maxHeight + containerTop + containerHeight;

				if (itemBot > limY) {
					if (!S.params.forceRenderBelow) {
						S.$items.addClass(S.classes.above);
					}
				}
				else {
					S.$items.removeClass(S.classes.above);
				}

				S.$items.css({
					'max-height': (maxHeight / 16) +'rem'
				});

			}).on(S.triggers.close, function() {
				S.$items.css({
					'max-height': '0'
				});

				S.$items.find('li').removeClass(S.classes.itemHover);
			});

			S.$select.on('blur', function(e) {
				e.preventDefault();
				e.stopPropagation();
				if (S.props.mobile && S.params.nativeOnMobile) {
					S.$container.removeClass(S.classes.open);
					return;
				}
				S.closeTimer = window.setTimeout(function() {
					S.$container.removeClass(S.classes.open);
					S.$select.trigger(S.triggers.close, S);
				}, 250);
			}).on('focus', function(e) {
				e.preventDefault();
				e.stopPropagation();
				S.$container.addClass(S.classes.open);
				if (S.props.mobile && S.params.nativeOnMobile) {
					return;
				}

				window.clearTimeout(S.closeTimer);
				S.keys = '';
				S.$select.trigger(S.triggers.open, S);
			}).on('keydown', function(e) {
				e.preventDefault();
				e.stopPropagation();
				if ((S.props.mobile && S.params.nativeOnMobile) || e.which == 9) {
					return;
				}
				else {
					S.keypress(e.which);
				}
			});

			S.$container.on('click', function(e) {
				if (S.props.mobile && S.params.nativeOnMobile) {
					return;
				}

				e.stopPropagation();
				e.preventDefault();

				if (S.$container.hasClass(S.classes.open)) {
					S.$select.trigger('blur');
					S.$select.triggerHandler('blur');
					return;
				}

				S.$select.trigger('focus');
				S.$select.triggerHandler('focus');
			});
			
			if (S.params.validateOnSubmit) {
				var $form = S.$select.closest('form');

				if ($.contains($form[0], S.$select[0])) {
					$form.on('submit', function(e) {
						if (S.$select.prop('required') && (S.$select.val() == S.$placeholder.val() || S.$select.val() === null || S.$select.val() === '')) {
							S.$container.addClass(S.classes.invalid);
							S.$select.one('change', function() { S.$container.removeClass(S.classes.invalid); });
							e.preventDefault();
						}
					});
				}
			}

			if (!S.props.mobile) {
				S.$container.on('mouseenter', function() {
					S.$container.addClass(S.classes.hover);
				}).on('mouseleave', function() {
					S.$container.removeClass(S.classes.hover);
				});
			}

			S.populate();
			S.$select.trigger(S.triggers.init, S);
		},

		populate: function() {
			var S = this,
				grp = S.$select.find('optgroup'),
				opt = S.$select.find('option');

			S.length = 0;
			S.items = [];

			if (grp.length) {
				opt.first().attr('disabled', true);
				var m = 1,
					$list = $('<ul></ul>');

				grp.each(function(idx, ogr) {
					$list.append('<li class="'+ S.classes.grouplabel +'" data-index="'+ m +'">'+ $(ogr).attr('label') +'</li>');
					$(ogr).find('option').each(function(i, o) {
						m++;
						var newItem = $(S.params.template.item).text($(o).text()).attr('data-value', $(o).val()).attr('data-index', m);
						$list.append(newItem);
						S.items.push({ value: $(o).val(), text: $(o).text().toLowerCase()});
						S.length++;
					});
					m++;
				});

				S.$items.append($list);
			}
			else {
				S.$items.html('<ul></ul>');

				opt.each(function(idx, opt) {
					var currOpt = S.$select.children().eq(idx),
						$list = S.$items.find('ul');

					if (!currOpt.attr('disabled') && !currOpt.hasClass(S.classes.placeholder)) {
						var newItem = $(S.params.template.item).text(currOpt.text()).attr('data-index', idx).attr('data-value', currOpt.val());
						$list.append(newItem);
						S.items.push({ value: $(opt).val(), text: $(opt).text().toLowerCase()});
						S.length++;
					}
				});
			}

			S.$items.off('click').on('click', 'li', function(e) {
				e.stopPropagation();
				var $item = $(e.target);

				if ($item.hasClass(S.classes.grouplabel)) {
					return;
				}
				else {
					S.select($item);
					if (S.props.multi || S.params.keepOpen) {
						window.clearTimeout(S.closeTimer);
						S.$select.triggerHandler('focus');
						S.$select.trigger('focus');
					}
				}
			});

			if (!S.props.mobile) {
				S.$items.find('li').not('.'+ S.classes.grouplabel).off('mouseenter').on('mouseenter', function(e) {
					S.$items.find('li').removeClass(S.classes.itemHover);
					$(e.target).addClass(S.classes.itemHover);
				});
			}

			S.$items.attr('data-length', S.length);
			S.$select.trigger(S.triggers.populated, S);
		},

		select: function($item) {
			var S = this,
				$option = S.$select.find('option[value="'+ $item.attr('data-value') +'"]');

			if (S.props.multi) {
				if ($option.prop('selected')) {
					$option.prop('selected', false);
				}
				else {
					$option.prop('selected', true);
				}
			}
			else {
				S.$select.find('option').prop('selected', false);
				$option.prop('selected', true);
			}

			S.$select.trigger('change');
			S.$select.trigger(S.triggers.change, S);
		},

		deselect: function(value) {
			var S = this,
				$option = S.$select.find('option[value="'+ value +'"]');

			$option.prop('selected', false);
			S.$select.trigger('change');
			S.$select.trigger(S.triggers.change, S);

			return;
		},

		keypress: function(keyCode) {
			var S = this;

			switch(keyCode) {
				case 32: // space
					S.$container.trigger('click');
				break;

				case 13: // enter
					var $highlighted = S.$items.find('li.highlighted');

					if ($highlighted.length) {
						S.select($highlighted);
					}
					else {
						S.$container.trigger('click');
					}
				break;

				case 27: // esc
					S.$select.trigger('blur');
				break;

				case 37: // left
				case 38: // up
					S.highlight('prev');
				break;

				case 39: // right
				case 40: // down
					S.highlight('next');
				break;

				default: // alphanumeric
					if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90)) {
						S.keys += String.fromCharCode(keyCode).toLowerCase();
						S.lookup(S.keys);
					}
			}
		},

		lookup: function(needle) {
			var S = this,
				match = false;

			if (S.items.some(function(e) { return (e.text.indexOf(needle) === 0); })) {
				for (var i = 0; i < S.items.length; i++) {
					if (S.items[i].text.indexOf(needle) === 0) {
						match = i;
						break;
					}
				}

				S.highlight(S.items[match].value);
			}
			else {
				S.keys = '';
			}
		},

		highlight: function(item) {
			var S = this,
				$highlighted = S.$items.find('li.'+ S.classes.itemHover).length ? S.$items.find('li.'+ S.classes.itemHover).first() : S.$items.find('li.'+ S.classes.itemSelected).first(),
				$target = false;

			if (!S.$container.hasClass(S.classes.open)) {
				return;
			}

			switch(item) {
				case 'prev':
					if (!$highlighted.length) {
						$target = S.$items.find('li').not('.'+ S.classes.grouplabel).first();
					}
					else {
						$target = $highlighted.prevAll('li').not('.'+ S.classes.grouplabel).first();
					}
				break;

				case 'next':
					if (!$highlighted.length) {
						$target = S.$items.find('li').not('.'+ S.classes.grouplabel).first();
					}
					else {
						$target = $highlighted.nextAll('li').not('.'+ S.classes.grouplabel).first();
					}
				break;

				default:
					$target = S.$items.find('li[data-value="'+ item +'"]');
			}

			if ($target.length) {
				S.$items.find('li').removeClass(S.classes.itemHover);
				$target.addClass(S.classes.itemHover);
				S.curr = $target.attr('data-value');
				S.$items.animate({
					scrollTop: $target.outerHeight() * ($target.attr('data-index') - 1)
				}, 'fast');
			}
		},

		refresh: function() {
			var S = this;
			S.populate();
			S.$select.trigger(S.triggers.refresh, S);
		},

		writeLabel: function(strLabel) {
			var S = this;
			S.$label.html(strLabel);
		}
	};

	$.fn[_S] = function(args) {
		return this.each(function() {
			var data = $.data(this, _S);

			if ((typeof data) === 'object') {
				if ((typeof args) === 'string' && data[args]) {
					data[args]();
				}
				else {
					if ((typeof args) === 'object' && args != data.params && data[args.action]) {
						data[args.action](args.options);
					}
				}
			}
			else {
				$.data(this, _S, new Selecta(this, args));
			}
		});
	};

	$.fn[_S].defaults = {
		firstAsPlaceholder: true,
		show: 5,
		template: {
			main: '<div class="selecta"><div class="selecta-element"></div><div class="selecta-label"></div><div class="selecta-items"></div></div>',
			item: '<li></li>',
			label: '<span></span>',
			placeholder: '<span class="selecta-label-placeholder"></span>',
			pill: '<span class="selecta-pill"></span>'
		}
	};
}));