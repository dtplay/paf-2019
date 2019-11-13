export interface OrderDetail {
  description: string;
  quantity: number;
}

export interface Order {
  email: string;
  orderDetails:  OrderDetail[]
}
