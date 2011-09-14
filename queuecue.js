(function() {

var _backupQC = typeof QC === 'undefined' ? null : QC;
window.QC = {};

QC.parallel = function() {
      
  var _queue = [], _outstanding = 0, _finishedCallback, _running = false;
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
    
    if (typeof cb == 'function') {
      _finishedCallback = cb;
    }
    while (item = _queue.shift()) {
      if (typeof item.triggered !== 'undefined') continue;
      params = Array.prototype.slice.call(item.params); // copy params so we can push the callback
      params.push(complete); // add the callback for the async function to call when it's done
      item.func.apply(item.scope, params);
      item.triggered = true;
    }
    _running = true;
  };
  
  function complete() {
    if (--_outstanding === 0 && typeof _finishedCallback == 'function') {
      _running = false;
      this.push = null;
      _finishedCallback();
    }
  }
  
  return this;
};


QC.serial = function() {
  var _queue = [], _finishedCallback, _self = this;
  this.q = _queue;
  
  this.push = function(func, params, scope) {
    params = params || [];
    scope = scope || window;
    _queue.push({func: func, scope: scope, params: params});
    return this;
  };
  
  this.run = function(cb) {
    var item, params;
    
    if (typeof cb == 'function') {
      _finishedCallback = cb;
    }
    if (item = _queue.shift()) {
      params = Array.prototype.slice.call(item.params); // copy params so we can push the callback
      params.push(continuation); // add the callback for the async function to call when it's done
      item.func.apply(item.scope, params);
      item.triggered = true;
    } else if (typeof _finishedCallback == 'function') {
      _finishedCallback();
    }
      
  };
  
  function continuation() {
    _self.run();
  }
  
  return this;
}


QC.noConflict = function() {
  var newObj = QC;
  QC = _backupQC;
  return newObj;
};

})();
