// Generated by CoffeeScript 1.7.1
var KEY_DOWN, KEY_ENTER, KEY_ESC, KEY_UP, SwitcherModel, SwitcherView, TabItemView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

KEY_ENTER = 13;

KEY_ESC = 27;

KEY_UP = 38;

KEY_DOWN = 40;

SwitcherModel = (function() {
  function SwitcherModel() {
    this.activeSelected = __bind(this.activeSelected, this);
    this.resetFilter = __bind(this.resetFilter, this);
    this.filterTabs = __bind(this.filterTabs, this);
    this.setSearchAllWindows = __bind(this.setSearchAllWindows, this);
    this.setSelected = __bind(this.setSelected, this);
    this.setTabs = __bind(this.setTabs, this);
    this.onSelectedChange = __bind(this.onSelectedChange, this);
    this.onTabsChange = __bind(this.onTabsChange, this);
    this.fetchTabs = __bind(this.fetchTabs, this);
    var searchAllWindows, selected, tabs;
    tabs = [];
    selected = 0;
    searchAllWindows = localStorage.getItem('searchAllWindows');
    this.searchAllWindows = searchAllWindows ? JSON.parse(searchAllWindows) : false;
    this._tabsChangeCallbacks = [];
    this._selectedChangeCallbacks = [];
    this._nextFetchListeners = [];
    chrome.runtime.onMessage.addListener((function(_this) {
      return function(request, sender, sendResponse) {
        var cb, _i, _len, _ref;
        if (request.tabs) {
          _this.setTabs(request.tabs, request.lastActive);
          _ref = _this._nextFetchListeners;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cb = _ref[_i];
            cb();
          }
          return _this._nextFetchListeners = [];
        }
      };
    })(this));
  }

  SwitcherModel.prototype.fetchTabs = function(cb) {
    if (cb != null) {
      this._nextFetchListeners.push(cb);
    }
    return chrome.runtime.sendMessage({
      sendTabData: true,
      searchAllWindows: this.searchAllWindows
    });
  };

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

  SwitcherModel.prototype.setSearchAllWindows = function(val) {
    this.searchAllWindows = !!val;
    return localStorage.setItem('searchAllWindows', JSON.stringify(this.searchAllWindows));
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

  SwitcherModel.prototype.activeSelected = function() {
    var tab;
    tab = this.tabs[this.selected];
    return chrome.runtime.sendMessage({
      switchToTabId: tab.id
    });
  };

  return SwitcherModel;

})();

TabItemView = (function() {
  function TabItemView(tab) {
    var div;
    this.element = $("<li>");
    this.element.data('tab', tab);
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
    var body, _ref;
    this.model = model;
    this.close = __bind(this.close, this);
    this.handleClick = __bind(this.handleClick, this);
    this.handleMouseover = __bind(this.handleMouseover, this);
    this.handleInputKeyUp = __bind(this.handleInputKeyUp, this);
    this.handleInputKeyDown = __bind(this.handleInputKeyDown, this);
    this.handleSearchAllWindowsChange = __bind(this.handleSearchAllWindowsChange, this);
    _ref = [], this.list = _ref[0], this.input = _ref[1];
    body = $('body');
    this.input = body.find('input[type=text]');
    this.checkbox = body.find('input[type=checkbox]');
    this.list = body.find('ul');
    this.input.focus();
    if (this.model.searchAllWindows) {
      this.checkbox.prop('checked', true);
    }
    this.input.on('keydown', this.handleInputKeyDown);
    this.input.on('keyup', this.handleInputKeyUp);
    this.checkbox.on('change', this.handleSearchAllWindowsChange);
    this.list.on('mouseover', 'li', this.handleMouseover);
    this.list.on('click', 'li', this.handleClick);
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

  SwitcherView.prototype.handleSearchAllWindowsChange = function() {
    var val;
    val = this.checkbox.prop('checked');
    this.model.setSearchAllWindows(val);
    this.input.focus();
    return this.model.fetchTabs((function(_this) {
      return function() {
        if (_this.input.val()) {
          return _this.model.filterTabs(_this.input.val());
        }
      };
    })(this));
  };

  SwitcherView.prototype.handleInputKeyDown = function(evt) {
    switch (evt.which) {
      case KEY_ESC:
        this.close();
        break;
      case KEY_ENTER:
        this.model.activeSelected();
        this.close();
        break;
      case KEY_UP:
        this.model.setSelected(Math.max(0, this.model.selected - 1));
        evt.preventDefault();
        break;
      case KEY_DOWN:
        this.model.setSelected(Math.min(this.model.tabs.length - 1, this.model.selected + 1));
        evt.preventDefault();
    }
    return null;
  };

  SwitcherView.prototype.handleInputKeyUp = function(evt) {
    var current, _ref;
    if ((_ref = evt.which) === KEY_ESC || _ref === KEY_ENTER || _ref === KEY_UP || _ref === KEY_DOWN) {
      return;
    }
    current = $(evt.target).val();
    if (current !== this.lastInput) {
      if (current) {
        this.model.filterTabs(current);
      } else {
        this.model.resetFilter();
      }
      this.lastInput = current;
    }
    return null;
  };

  SwitcherView.prototype.handleMouseover = function(evt) {
    var index, parents, tab, target;
    target = $(evt.target);
    if (target.is('li')) {
      tab = target.data('tab');
    } else {
      parents = target.parents('li');
      if (parents.length) {
        tab = $(parents.get(0)).data('tab');
      }
    }
    if (tab) {
      index = this.model.tabs.indexOf(tab);
      return this.model.setSelected(index);
    }
  };

  SwitcherView.prototype.handleClick = function(evt) {
    this.model.activeSelected();
    return this.close();
  };

  SwitcherView.prototype.close = function() {
    return window.close();
  };

  return SwitcherView;

})();

$(function() {
  var model, view;
  model = new SwitcherModel();
  view = new SwitcherView(model);
  model.fetchTabs();
  return $(window).on('blur', view.close);
});