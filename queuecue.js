(function() {

var _backupQC = typeof QC === 'undefined' ? undefined : QC;
window.QC = {};

QC.parallel = function() {
  var _queue = [],
      _outstanding = 0,
      _finishedCallback,
      _running = false,
      _self = this,
      _commObj;
      
  _commObj = {
    insert: function(func, params, scope) {
      params = params || [];
      scope = scope || window;
      _queue.unshift({func: func, scope: scope, params: params});
      _outstanding++;
      
      _self.run();
      
      return _commObj;
    },
    return: function() {
      if (--_outstanding === 0 && typeof _finishedCallback == 'function') {
        _running = false;
        this.push = null;
        _finishedCallback();
      }
    }
  };
    
  this.q = _queue;
  this.push = function(func, params, scope) {
    params = params || [];
    scope = scope || window;
    _outstanding++;
    _queue.push({func: func, scope: scope, params: params});
    if (_running === true) {
      this.run();
    }
    return this;
  };
  
  this.run = function(cb) {
    var item, params;
    
    if (typeof cb !== 'undefined' && typeof cb.return == 'function') {
      _finishedCallback = cb.return;
    } else if (typeof cb === 'function') {
      _finishedCallback = cb;
    }
    while (item = _queue.shift()) {
      if (typeof item.triggered !== 'undefined') continue;
      params = Array.prototype.slice.call(item.params); // copy params so we can push the callback
      params.push(_commObj); // add the callback for the async function to call when it's done
      item.func.apply(item.scope, params);
      item.triggered = true;
    }
    _running = true;
  };
  
  return this;
};


QC.serial = function() {
  var _queue = [],
      _finishedCallback,
      _self = this,
      _commObj;
      
  _commObj = {
    insert: function(func, params, scope) {
      params = params || [];
      scope = scope || window;
      _queue.unshift({func: func, scope: scope, params: params});
      return _commObj;
    },
    return: function() {
      _self.run();
    }
  };
  
  this.q = _queue;
  
  this.push = function(func, params, scope) {
    params = params || [];
    scope = scope || window;
    _queue.push({func: func, scope: scope, params: params});
    return this;
  };
  
  this.run = function(cb) {
    var item, params;
    
    if (typeof cb !== 'undefined' && typeof cb.return == 'function') {
      _finishedCallback = cb.return;
    } else if (typeof cb === 'function') {
      _finishedCallback = cb;
    }
    if (item = _queue.shift()) {
      params = Array.prototype.slice.call(item.params); // copy params so we can push the callback
      params.push(_commObj); // add the callback for the async function to call when it's done
      item.func.apply(item.scope, params);
      item.triggered = true;
    } else if (typeof _finishedCallback == 'function') {
      _finishedCallback();
    }
      
  };
  
  return this;
}


QC.noConflict = function() {
  var newObj = QC;
  QC = _backupQC;
  return newObj;
};

})();
