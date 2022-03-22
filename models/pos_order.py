# -*- encoding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
import logging

class PosOrder(models.Model):
    _inherit = 'pos.order'


    def obtener_inventario_producto(self,producto,tipo_ubicacion,lote):
        logging.warning('BIENVENIDO A LA FUNCION obtener_inventario_producto')
        cantidad_producto = 0
        producto_id = self.env['product.product'].search([('id','=',producto)])
        tipo_ubicacion_id = self.env['stock.picking.type'].search([('id','=',tipo_ubicacion)])
        lote_id = False
        logging.warning("Lote_id")
        logging.warning(lote_id)
        if producto_id  and producto.route_ids and len(producto.route_ids) == 1 and tipo_ubicacion_id:
            if lote:
                lote_id = self.env['stock.production.lot'].search([('name','=',lote),('product_id','=',producto_id.id)])
                if lote_id:
                    # quant = self.env['stock.quant'].search([('product_id','=',producto_id.id),('lot_id','=',lote_id.id),('location_id','=',tipo_ubicacion_id.default_location_src_id.id)])
                    quant = self.env['stock.quant'].search([('product_id','=',producto_id.id),('lot_id','=',lote_id[0].id),('location_id','=',tipo_ubicacion_id.default_location_src_id.id)])
                    # existencia = self.env['stock.quant']._get_available_quantity(producto_id,tipo_ubicacion_id.default_location_src_id,lote_id)
                    if quant:
                        cantidad_producto = quant.quantity - quant.reserved_quantity
            else:
                quant = self.env['stock.quant'].search([('product_id','=',producto_id.id),('location_id','=',tipo_ubicacion_id.default_location_src_id.id)])
                if quant:
                    cantidad_producto = quant.quantity - quant.reserved_quantity
        return cantidad_producto

    def prevalidar_pedido(self, dicc_prod_lotes, dicc_lineas_producto):
        lista_errores = [];
        logging.warning('')
        logging.warning('FUNCION PREVALIDAR PEDIDO')
        logging.warning(dicc_lineas_producto)

        logging.warning(dicc_prod_lotes)
        logging.warning('')

        for id in dicc_lineas_producto:
            # logging.warning('-------------------------')
            # logging.warning(dicc_lineas_producto[id])
            if dicc_lineas_producto[id]['has_product_lot'] and dicc_lineas_producto[id]['pack_lot_lines_lenght']>0:
                logging.warning('-------------------------')
                logging.warning(dicc_lineas_producto[id])
                for n_nombre_lote in dicc_lineas_producto[id]['pack_lot_lines_models[0]_get_lot_name()']:
                    lote = self.env['stock.production.lot'].search([('name','=',n_nombre_lote)])

                    if len(lote)==0:
                        lista_errores.append('Lote incorrecto')
                        lista_errores.append(n_nombre_lote)
                    else:
                        inventario_producto = self.obtener_inventario_producto(id, dicc_lineas_producto[id]['product_pos_config_picking_type_id[0]'], n_nombre_lote)
                        if inventario_producto:
                            lot_prod_id = id +'-'+dicc_lineas_producto[id]['product_pack_lot_lines_models[0][changed][lot_name]']
                            if (lot_prod_id in dicc_prod_lotes):
                                if (dicc_prod_lotes[lot_prod_id] > inventario_producto):
                                    if len(lista_errores) == 0:
                                        lista_errores.append('NO HAY EXISTENCIA DE PRODUCTO')
                                        lista_errores.append(dicc_lineas_producto[id]['product_pack_lot_lines_models[0][changed][lot_name]'])
            else:
                if dicc_lineas_producto[id]['product_type'] == 'product':
                    inventario_producto2 = self.obtener_inventario_producto(id, dicc_lineas_producto[id]['product_pos_config_picking_type_id[0]'], False)
                    if dicc_lineas_producto[id]['product_quantity'] >inventario_producto2 :
                        if len(lista_errores) ==0:
                            lista_errores.append('NO HAY EXISTENCIA DE PRODUCTO')
                            lista_errores.append(dicc_lineas_producto[id]['product_display_name']+': '+str(inventario_producto2))
            logging.warning('')
            logging.warning('')



        return lista_errores;
