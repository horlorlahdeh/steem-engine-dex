import { MarketService } from './../../services/market-service';
import { checkTransaction } from 'common/steem-engine';
import { sleep } from 'common/functions';
import { loading } from 'store/actions';
import { dispatchify } from 'aurelia-store';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class NftSellModal {
    private symbol;
    private nftId;
    private price;
    private priceSymbol;
    private user;
    private errors: string[] = [];

    constructor(private controller: DialogController, private marketService: MarketService) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(token) {
        console.log(token);
        this.symbol = token.symbol;
        this.nftId = token._id;
    }

    async placeSellOrder() {
        dispatchify(loading)(true);

        try {
            const response = await this.marketService.sell(this.symbol, this.nftId, this.price, this.priceSymbol) as any;

            if (response.success) {
                try {
                    const verify = await checkTransaction(response.result.id, 3);
                    
                    if (verify?.errors) {
                        this.errors = verify.errors;
                    } else {
                        await sleep(3200);
                        this.controller.ok();
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            dispatchify(loading)(false);
        } catch {
            dispatchify(loading)(false);
        }
    }
}