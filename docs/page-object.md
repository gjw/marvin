# Page object

In marvin-js we make full use of the Page Object pattern to model and abstract interactions with pages to reduce duplicated code and make tests easy to update as and when the UI changes.

To create a page object:

```javascript
// tests/pages/home.js
var Page = require('marvin-js').Page;

module.exports = new Page({

  url: { value: '/' },

  txtSearch: { get: function () { return this.element("input[id='txtSearch']"); } },
  btnSearch: { get: function () { return this.element('btn-primary', 'className'); } },

  searchFor: { value: function (query) {
    this.txtSearch.sendKeys(query);
    this.btnSearch.click();
  }}

});
```

Each page has a url, some elements and any convenient methods that you may require.

Elements are found by css selector (or optionally another locator type can be specified) and return a selenium web-element which can be interacted with as [per usual](https://code.google.com/p/selenium/wiki/WebDriverJs). A full reference can be found [here](/README.md#page-object-reference).

You can then use your page objects in your step definitions:

```javascript
// tests/steps/home-search-steps.js
var homePage = require('../pages/home'),
    searchResults = require('../pages/search-results');

exports.define = function (steps) {

  steps.given("I visit the home page", function () {
    homePage.visit();
  });

  steps.when("I search for '$query'", function (query) {
    homePage.txtSearch.sendKeys(query);
    homePage.btnSearch.click();
    // Or use homePage.searchFor(query);
  });

  steps.then("I should see '$heading' in the heading", function (heading) {
    searchResults.heading.getText().then(function (text) {
      text.should.equal(heading);
    });
  });

};

```

## Page object reference

As the examples show, all interactions with page elements (and the underlying driver) are abstracted away in your page objects. When you create a page object you have various ways of attaching elements to it so they can be interacted with in your step definitions:

```javascript
var Page = require('marvin-js').Page;

module.exports = new Page({

  url: { value: '/search' },

  aTxtInput:  { get: function () { return this.element("input[id='txtSearch']"); } },
  buttons:    { get: function () { return this.elements("button"); } },
  aSelect:    { get: function () { return this.select("select[name='rt-child']"); } },
  aComponent: { get: function () { return this.component(yourComponent, "div[class='container']"); } },

  onLoad: { value: function () {
    // Some code to run immediately after the page is loaded.
  } }

});
```

* Setting a url value is for when you call `visit()` on your page object. e.g: `examplePage.visit();`. These url's are relative to the baseUrl set in your config, but if you set a full url like `http://www.example.com` the baseUrl will be ignored. Additionally, `visit()` can take an optional query object with two possible properties: pathValues that contains an array with URL placeholder replacements, and querystring that contains a query string like `?param1=value1&param2=value2`, e.g. `examplePage.visit({querystring: '?param1=value1&param2=value2' });` will visit `http://yourBaseUrl?param1=value1&param2=value2`.

* `element(selector, type)` - is used to find a specific element by selector type and returns a selenium webelement. The type is optional and if not supplied the default of 'css' is used (as in the examples above). You can specify another locator type if required - `this.element('//a/b/c', 'xpath')`. Elements are then accessed from your page objects: `examplePage.aTxtInput.click();`. All of [Selenium's locator](https://code.google.com/p/selenium/source/browse/javascript/webdriver/locators.js#212) types are supported.

* `elements(selector, type)` - is used to find all elements on the page that satisfy the selector and returns a collection of selenium webelements. e.g:
```javascript
examplePage.buttons.then(function (elems) {
  elems.forEach(function (elem) {
    // etc..
  });
});
```

* `select(selector, type)` - is the same as `element` but adds a helper `selectOption(optionValue)` to the element to enable easy option selection. e.g: `examplePage.aSelect.selectOption(3);`

* `component(yourComponent, rootNode)` - Attaches a component you have defined to your page. Please see [components](#components).

There are some additional helper methods you can use:

* `waitFor(fn, timeout)` - Exposes selenium's `driver.wait`, to explicitly wait for a specific condition to be true. e.g:
```javascript
search: { value: function (query) {
    var _this = this;
    this.waitFor(function () {
      return _this.aTxtInput.isDisplayed();
    }, 5000);
    this.aTxtInput.sendKeys(query);
} }
```

* `onLoad()` - An optional function you can define that is run when the page is loaded.

Components are the same and have access to the same element methods, but not the page specific ones: `visit()`, `title()`, `alert()` & `component()`.
Please see the official [selenium webdriver](https://code.google.com/p/selenium/wiki/WebDriverJs) documentation for further information on working with elements.

## Page load

Sometime it is useful to execute a script at the page load, may it be a screenshot capture or a init function; you have two main methods to execute a custom script after the page is loaded: the Page object can expose a property called `onLoad` that is called every time that page is loaded, or if you need to execute a script only for certain steps, the `step.visit()` function returns a promise, that can be chained.

```javascript
module.exports = new Page({
    onLoad: {
        value: function() {
          session.saveScreenshot('item');
        }
    }
});
```