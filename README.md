# Selecta
Selecta is a very simple jQuery plugin to customise the display of select dropdown fields.
It is designed to be very flexible and it probably won't work very well as a drop-in solution. I am of the opinion that a plugin or add-on should not dictate how one formats their stylesheets or markup, so the default styles for Selecta are very bare on purpose and you will need to add your own styles in order to make it look presentable.

## How to Use
### Javascript
First, make sure you are including the jQuery library in your code. Then, include Selecta.
To initialise Selecta, just provide it with a jQuery object (or collection of objects) along with your options, if any.

Example:
```javascript
    $('select').Selecta({
        nativeOnMobile: false,
        class: 'my-custom-select'
    });
```

#### Options
##### show (integer)
Number of items to display upon opening the menu. Default is **5**.

##### keepOpen (boolean)
Indicates whether menu should remain open after the user selects an item. Default is **false**.

##### nativeOnMobile (boolean)
Indicates whether native functionality should be used on mobile / touchscreen devices. Default is **false**.

##### forceRenderBelow (boolean)
Indicates whether dropdown should always render below the label. Default is false.

##### validateOnSubmit (boolean)
Indicates whether the element should be validated when its containing form is submitted. Default is **false**.

##### firstAsPlaceholder (boolean)
Indicates whether the script should take the first item in the dropdown as its placeholder (item becomes hidden and unselectable). Default is **true**.

##### class (string)
Additional class(es) to add to the container. Default is null.

##### detectMobile (function)
Provides a different function for detecting mobile devices (default is Modernizr.touchevents with a fallback to window.matchMedia). Needs to return a boolean value (true/false) for mobile detection to work.

Example:
```javascript
    $('.select-menu').Selecta({
		nativeOnMobile: true,
		detectMobile: function() {
			return $('.element').hasClass('mobile');
		}
	});
```

#### Events
All events are fired on the form element itself. Custom events will return the Selecta object as a payload.

Example:
```javascript
    $('select').on('selecta-change', function(event, selectaObj) {
        console.log('This menu has '+ selectaObj.length +' items.');
    });
```

##### selecta-init
Fires when Selecta is initialised on the element.

##### selecta-open
Fires when menu is opened.

##### selecta-closed
Fires when menu is closed.

##### selecta-change 
Fires when value of element changes.

##### selecta-populated 
Fires when element options are populated.

##### selecta-refresh 
Fires when Selecta is reinitialised on element.

#### Methods 
*This part is still a work in progress.*

##### refresh 
Reinitialises Selecta. This is particularly useful in occasions where the options in one dropdown change dynamically based on the value of another form field.

Example:
```javascript
    $('select.my-menu').append('<option value="foo">Foo</option><option value="bar">Bar</option>');
    $('select.my-menu').Selecta('refresh');
```

### CSS
If your project already uses SASS and Compass, the best way to style Selecta is by using the mixin provided in the _selecta.scss_ file. Otherwise, the _selecta.css_ file provided in the _/dist_ directory should give you a decent starting point.

#### The Selecta Mixin
The Selecta SCSS mixin takes two parameters only: **height** and **background colour**. These default to _2.75rem_ and _#fff_ respectively. You should add all your other styles after the mixin is called.

Example:
```css
.selecta {
    @include Selecta(2.5rem, #eee);
    font-family: Helvetica, Arial, sans-serif;
    font-size: 1rem;
    
    .selecta-label {
        .selecta-label-wrapper {
            padding: 0 .5rem 0 1.25rem;
        }
    }
    
    .selecta-items {
        li {
            padding: .25rem 1rem;
            
            &.highlighted {
                background-color: #eee;
            }
            
            &.selected {
                background-color: #333;
                color: #fff;
            }
        }
    }
}
```