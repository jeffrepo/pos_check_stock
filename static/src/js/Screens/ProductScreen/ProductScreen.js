odoo.define('pos_check_stock.ProductScreen', function(require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const PosComponent = require('point_of_sale.PosComponent');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const rpc = require('web.rpc');
    var { Gui } = require('point_of_sale.Gui');
    var core = require('web.core');

    var _t = core._t;

    const PosProductScreen = ProductScreen =>
      class extends ProductScreen {
        constructor(){
          super(...arguments);
          useListener('click-pay', this._onClickPay);
        }

        _onClickPay(){
          super._onClickPay();
          this.showScreen('ProductScreen');
          this.productos_inventario();

        }

        productos_inventario(){

          var self = this;
          var cambiar_pantalla = true;
          var order = self.env.pos.get_order();

          var dicc_lineas_producto = {};

          var has_valid_product_lot = _.every(order.orderlines.models, function(line){
              return line.has_valid_product_lot();
          });

          var dicc_prod_lotes = {}

          order.get_orderlines().forEach(function(prod){

            if (prod.has_product_lot == true && prod.pack_lot_lines.length > 0 && prod.sale_order_line_id == 0 ) {
              var id_lote = prod.product.id +"-"+ prod.pack_lot_lines.models[0]['changed']['lot_name'];
              if (!(id_lote in dicc_prod_lotes)) {
                dicc_prod_lotes[id_lote]=0
              }

              if ( id_lote in dicc_prod_lotes) {
                dicc_prod_lotes[id_lote]+=prod.get_quantity();
              }

            }

            if(!(prod.product.id in dicc_lineas_producto)){
              dicc_lineas_producto[prod.product.id]={
                'product_id': prod.product.id,
                'product_display_name':prod.product.display_name,
                'product_type':prod.product.type,
                'product_quantity':0,
                'has_product_lot':false,
                'pack_lot_lines_lenght':0,
                'pack_lot_lines_models[0]_get_lot_name()':[],
                'product_pos_config_picking_type_id[0]':'',
                'product_pack_lot_lines_models[0][changed][lot_name]':'',
              }
            }

            if (prod.product.id in dicc_lineas_producto) {
              dicc_lineas_producto[prod.product.id]['product_quantity'] += prod.quantity;
              dicc_lineas_producto[prod.product.id]['has_product_lot'] = prod.has_product_lot;
              dicc_lineas_producto[prod.product.id]['pack_lot_lines_lenght'] = prod.pack_lot_lines.length;
              if (prod.pack_lot_lines.length >0) {
                if (!(prod.pack_lot_lines.models[0].get_lot_name() in dicc_lineas_producto[prod.product.id]['pack_lot_lines_models[0]_get_lot_name()'])){
                  dicc_lineas_producto[prod.product.id]['pack_lot_lines_models[0]_get_lot_name()'].push(prod.pack_lot_lines.models[0].get_lot_name());
                }
                dicc_lineas_producto[prod.product.id]['product_pack_lot_lines_models[0][changed][lot_name]']=prod.pack_lot_lines.models[0]['changed']['lot_name'];
              }
              dicc_lineas_producto[prod.product.id]['product_pos_config_picking_type_id[0]']=prod.pos.config.picking_type_id[0];



            }

          });

          console.log('dicc_prod_lotes');
          console.log(dicc_prod_lotes);
          if (dicc_prod_lotes.length > 0){
              rpc.query({
                  model: 'pos.order',
                  method: 'prevalidar_pedido',
                  args: [[],dicc_prod_lotes,dicc_lineas_producto],
              })
              .then(function (respuesta){
                if (respuesta.length >0){
                  Gui.showPopup('ConfirmPopup', {
                    title: self.env._t(respuesta[0]),
                    body:respuesta[1],
                  }).then(({ confirmed }) => {

                      console.log("Linea 103");

                  });
                }else{
                  return self.showScreen('PaymentScreen');
                }

              });
          }else{
              return self.showScreen('PaymentScreen');
          }


        }

      };

      Registries.Component.extend(ProductScreen, PosProductScreen);

      return ProductScreen;
});
