export interface OrderDetail {
  ord_details_id?: number;
  description: string;
  quantity: number;
}

export interface Order {
  ord_id?: number;
  email: string;
  orderDetails:  OrderDetail[]
}
