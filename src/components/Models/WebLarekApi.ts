import { IApi } from '../../types';
import { IProduct, IOrder } from '../../types';

export class WebLarekApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  public getProducts(): Promise<IProduct[]> {
    return this.api.get<IProduct[]>('/product/');
  }

  public sendOrder(order: IOrder): Promise<object> {
    return this.api.post('/order/', order);
  }
}