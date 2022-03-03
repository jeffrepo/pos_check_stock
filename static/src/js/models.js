odoo.define('pos_check_stock.models', function (require) {
"use strict";

const { Context } = owl;
var models = require('point_of_sale.models');
// var { Gui } = require('point_of_sale.Gui');
var core = require('web.core');
var rpc = require('web.rpc');
var _t = core._t;


var _super_order = models.Order.prototype;
models.Order = models.Order.extend({

  initialize: function(){
    _super_order.initialize.apply(this,arguments);
    this.cambiar_pantalla = null;
  },
  //Parte a borrar
  set_cambiar_pantalla: function(cambiar_pantalla){
    this.cambiar_pantalla= cambiar_pantalla;
  },
  get_cambiar_pantalla: function(){
    return this.cambiar_pantalla;
  },


});




});
