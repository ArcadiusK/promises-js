/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:


var $Promise = function(){
  this.state = 'pending';
  this.handlerGroups = [];
  this.updateCbs = [];
  this.value = undefined;

  this.handle = function(data){
    if(this.state === 'resolved'){
      while(this.handlerGroups.length){
        var success = this.handlerGroups.shift();
        if(success.onResolve){
          success.onResolve(this.value);
        }
      }
      return this;
    } else if(this.state === 'rejected'){
      while(this.handlerGroups.length){
        var error = this.handlerGroups.shift();
        if(error.onReject){
          error.onReject(this.value);
        }
      }
      return this;
    } else if (this.state === 'pending'){
      for(var i =0; i < this.updateCbs.length; i++){
        this.updateCbs[i](data);
      }
      return this;
    }

  };

  this.catch = function(func){
    this.then(null, func);
 return this; 
  };


  this.then = function(success, error, update){
    var handlerGroup = {};
    handlerGroup.onResolve = (typeof success === 'function') ?
      success : undefined;
    handlerGroup.onReject = (typeof error === 'function') ?
      error : undefined;
    handlerGroup.forwarder = new defer();

    this.handlerGroups.push(handlerGroup);


    if(typeof update === 'function'){
      this.updateCbs.push(update);
    }


    if(this.state === 'resolved') this.handle(success);

    if(this.state === 'rejected') this.handle(error);

    return handlerGroup.forwarder.$promise;
  };

};

var Deferral = function(){
  this.$promise = new $Promise();
  this.resolve = function(data){
    if(this.$promise.state === 'pending'){
      this.$promise.value = data;
      this.$promise.state = "resolved";
    }

    this.$promise.handle();
    return this;

  };
  this.reject = function(reason){
    if(this.$promise.state === 'pending'){
      this.$promise.state = 'rejected';
      this.$promise.value = reason;
    }
    this.$promise.handle();
    return this;
  };

  this.notify = function(data){
    if(this.$promise.updateCbs[0]){
      this.$promise.handle(data);
    }

    return this;
  };

};

var defer = function(){
  return new Deferral();
};




/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
