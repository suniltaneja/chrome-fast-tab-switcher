// Generated by CoffeeScript 1.7.1
var KEY_DOWN, KEY_ENTER, KEY_ESC, KEY_UP, SwitcherModel, SwitcherView, TabItemView, model, template, view, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

template = "<style>\n  * {\n    box-sizing: border-box;\n  }\n\n  .container {\n    position: fixed;\n    width: 600px;\n    z-index: 9999999;\n    left: 50%;\n    top: 25px;\n    margin-left: -300px;\n    border: 1px solid black;\n    border-radius: 4px;\n    background: #eee;\n    box-shadow: #ccc 0 0 10px;\n    padding: 7px;\n  }\n\n  .container input[type=text] {\n    width: 100%;\n    height: 40px;\n    font-size: 26px;\n    margin: 0;\n    padding: 5px;\n    border-radius: 4px;\n    border: 1px solid #ccc;\n  }\n\n  .container input[type=text]:focus {\n    outline: none;\n  }\n\n  .container ul {\n    list-style: none;\n    padding-left: 0;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    margin: 10px -7px 0 -7px;\n  }\n\n  .container ul li {\n    margin-left: 0;\n    font-size: 15px;\n    font-family: Arial, sans-serif;\n    padding: 7px;\n    border-top: 1px solid #333;\n  }\n\n  .container ul li:last-child {\n    border-bottom: 1px solid #333;\n  }\n\n  .container ul li.selected {\n    background-color: white;\n  }\n\n  .container ul li .bkg {\n    vertical-align: bottom;\n    width: 16px;\n    height: 16px;\n    display: inline-block;\n    margin-right: 5px;\n    background-size: 16px 16px;\n  }\n\n  .container ul li .title {\n  }\n\n  .container ul li .match {\n    text-decoration: underline;\n  }\n\n  .container ul li .url {\n    color: #666;\n    margin-left: 21px;\n    padding-top: 5px;\n  }\n</style>\n\n<div class='container'>\n  <input type='text' size='30'>\n  <ul></ul>\n</div>";

KEY_ENTER = 13;

KEY_ESC = 27;

KEY_UP = 38;

KEY_DOWN = 40;

SwitcherModel = (function() {
  function SwitcherModel() {
    this.resetFilter = __bind(this.resetFilter, this);
    this.filterTabs = __bind(this.filterTabs, this);
    this.setSelected = __bind(this.setSelected, this);
    this.setTabs = __bind(this.setTabs, this);
    this.onSelectedChange = __bind(this.onSelectedChange, this);
    this.onTabsChange = __bind(this.onTabsChange, this);
    var selected, tabs;
    tabs = [];
    selected = 0;
    this._tabsChangeCallbacks = [];
    this._selectedChangeCallbacks = [];
  }

  SwitcherModel.prototype.onTabsChange = function(cb) {
    return this._tabsChangeCallbacks.push(cb);
  };

  SwitcherModel.prototype.onSelectedChange = function(cb) {
    return this._selectedChangeCallbacks.push(cb);
  };

  SwitcherModel.prototype.setTabs = function(tabs, lastSelectedId) {
    var cb, firstTab, otherTabs, tab, _i, _j, _len, _len1, _ref, _results;
    firstTab = [];
    otherTabs = [];
    for (_i = 0, _len = tabs.length; _i < _len; _i++) {
      tab = tabs[_i];
      if (tab.id === lastSelectedId) {
        firstTab.push(tab);
      } else {
        otherTabs.push(tab);
      }
    }
    this.tabs = firstTab.concat(otherTabs);
    this._origTabs = this.tabs;
    this.setSelected(0);
    _ref = this._tabsChangeCallbacks;
    _results = [];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      cb = _ref[_j];
      _results.push(cb(this.tabs));
    }
    return _results;
  };

  SwitcherModel.prototype.setSelected = function(index) {
    var cb, _i, _len, _ref, _results;
    this.selected = index;
    _ref = this._selectedChangeCallbacks;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cb = _ref[_i];
      _results.push(cb(this.selected));
    }
    return _results;
  };

  SwitcherModel.prototype.filterTabs = function(search) {
    var cb, key, match, newTabs, optsFor, tab, titleMatch, titleMatches, urlMatches, value, values, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _results;
    _ref = this._origTabs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tab = _ref[_i];
      delete tab._htmlTitle;
      delete tab._htmlUrl;
    }
    optsFor = function(field) {
      return {
        pre: "<span class='match'>",
        post: "</span>",
        extract: function(tab) {
          return tab[field];
        }
      };
    };
    titleMatches = fuzzy.filter(search, this._origTabs, optsFor('title'));
    urlMatches = fuzzy.filter(search, this._origTabs, optsFor('url'));
    newTabs = {};
    for (_j = 0, _len1 = titleMatches.length; _j < _len1; _j++) {
      match = titleMatches[_j];
      match.original._htmlTitle = match.string;
      newTabs[match.original.id] = match;
    }
    for (_k = 0, _len2 = urlMatches.length; _k < _len2; _k++) {
      match = urlMatches[_k];
      match.original._htmlUrl = match.string;
      if (titleMatch = newTabs[match.original.id]) {
        if (match.score > titleMatch.score) {
          newTabs[match.original.id] = match;
        }
      } else {
        newTabs[match.original.id] = match;
      }
    }
    values = (function() {
      var _results;
      _results = [];
      for (key in newTabs) {
        value = newTabs[key];
        _results.push(value);
      }
      return _results;
    })();
    this.tabs = values.sort(function(a, b) {
      return b.score - a.score;
    }).map(function(match) {
      return match.original;
    });
    this.setSelected(0);
    _ref1 = this._tabsChangeCallbacks;
    _results = [];
    for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
      cb = _ref1[_l];
      _results.push(cb(this.tabs));
    }
    return _results;
  };

  SwitcherModel.prototype.resetFilter = function() {
    var tab, _i, _len, _ref;
    _ref = this._origTabs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tab = _ref[_i];
      delete tab._htmlTitle;
      delete tab._htmlUrl;
    }
    return this.setTabs(this._origTabs);
  };

  return SwitcherModel;

})();

TabItemView = (function() {
  function TabItemView(tab) {
    var div;
    this.element = $("<li>");
    div = $('<div>');
    div.append($("<div>").addClass("bkg").css({
      backgroundImage: "url(" + tab.favIconUrl + ")"
    }));
    div.append($("<span>").addClass("title").html(tab._htmlTitle || tab.title));
    this.element.append(div);
    this.element.append($("<div>").addClass("url").html(tab._htmlUrl || tab.url));
  }

  return TabItemView;

})();

SwitcherView = (function() {
  function SwitcherView(model) {
    var shadow, _ref;
    this.model = model;
    this.hide = __bind(this.hide, this);
    this.show = __bind(this.show, this);
    this.handleInputKeyup = __bind(this.handleInputKeyup, this);
    _ref = [], this.list = _ref[0], this.input = _ref[1];
    this.host = $('<div>').attr('id', 'chrome-extension-quick-tab-switcher').attr('reset-style-inheritance', true).appendTo('body');
    shadow = this.host[0].createShadowRoot ? this.host[0].createShadowRoot() : this.host[0].webkitCreateShadowRoot();
    this.element = $(shadow);
    this.tmpl = $(template);
    this.container = this.tmpl.find('.container');
    this.list = this.tmpl.find('ul');
    this.input = this.tmpl.find('input');
    this.input.on('keyup', this.handleInputKeyup);
    this.host.on('click', function(evt) {
      return evt.stopPropagation();
    });
    this.model.onTabsChange((function(_this) {
      return function(tabs) {
        var tab, _i, _len;
        _this.list.empty();
        for (_i = 0, _len = tabs.length; _i < _len; _i++) {
          tab = tabs[_i];
          _this.list.append(new TabItemView(tab).element);
        }
        return $(_this.list.children().get(_this.model.selected)).addClass('selected');
      };
    })(this));
    this.model.onSelectedChange((function(_this) {
      return function(index) {
        _this.list.children().removeClass('selected');
        return $(_this.list.children().get(index)).addClass('selected');
      };
    })(this));
  }

  SwitcherView.prototype.handleInputKeyup = function(evt) {
    var current, tab;
    switch (evt.which) {
      case KEY_ESC:
        this.hide();
        break;
      case KEY_ENTER:
        tab = this.model.tabs[this.model.selected];
        this.hide();
        chrome.runtime.sendMessage({
          switchToTabId: tab.id
        });
        break;
      case KEY_UP:
        this.model.setSelected(Math.max(0, this.model.selected - 1));
        break;
      case KEY_DOWN:
        this.model.setSelected(Math.min(this.model.tabs.length - 1, this.model.selected + 1));
        break;
      default:
        current = $(evt.target).val();
        if (current !== this.lastInput) {
          if (current) {
            this.model.filterTabs(current);
          } else {
            this.model.resetFilter();
          }
          this.lastInput = current;
        }
    }
    return null;
  };

  SwitcherView.prototype.show = function() {
    this.element.append(this.tmpl);
    this.element[0].resetStyleInheritance = true;
    this.input.focus();
    $(document).on('click.switcher', this.hide);
    this.input.on('keydown.switcherBlocker', function(evt) {
      return evt.stopPropagation();
    });
    return this.input.on('keyup.switcherBlocker', function(evt) {
      return evt.stopPropagation();
    });
  };

  SwitcherView.prototype.hide = function() {
    $(document).off('click.switcher');
    this.input.off('keydown.switcherBlocker');
    this.input.off('keyup.switcherBlocker');
    this.tmpl.detach();
    this.input.val('');
    return this.lastInput = '';
  };

  return SwitcherView;

})();

_ref = [], model = _ref[0], view = _ref[1];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.tabs) {
    if (model == null) {
      model = new SwitcherModel();
    }
    if (view == null) {
      view = new SwitcherView(model);
    }
    model.setTabs(request.tabs, request.lastActive);
    return view.show();
  }
});