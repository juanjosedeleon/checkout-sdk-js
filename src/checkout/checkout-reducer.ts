import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';
import { omit } from 'lodash';

import { BillingAddressAction, BillingAddressActionType } from '../billing';
import { clearErrorReducer } from '../common/error';
import { objectMerge, objectSet } from '../common/utility';
import { CouponAction, CouponActionType, GiftCertificateAction, GiftCertificateActionType } from '../coupon';
import { OrderAction, OrderActionType } from '../order';
import { ConsignmentAction, ConsignmentActionType } from '../shipping';
import { StoreCreditAction, StoreCreditActionType } from '../store-credit/store-credit-actions';

import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutState, { CheckoutDataState, CheckoutErrorsState, CheckoutStatusesState, DEFAULT_STATE } from './checkout-state';

export default function checkoutReducer(
    state: CheckoutState = DEFAULT_STATE,
    action: Action
): CheckoutState {
    const reducer = combineReducers<CheckoutState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: CheckoutDataState | undefined,
    action: CheckoutAction | BillingAddressAction | ConsignmentAction | CouponAction |
        GiftCertificateAction | OrderAction | StoreCreditAction
): CheckoutDataState | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case CheckoutActionType.UpdateCheckoutSucceeded:
    case StoreCreditActionType.ApplyStoreCreditSucceeded:
    case BillingAddressActionType.UpdateBillingAddressSucceeded:
    case CouponActionType.ApplyCouponSucceeded:
    case CouponActionType.RemoveCouponSucceeded:
    case ConsignmentActionType.CreateConsignmentsSucceeded:
    case ConsignmentActionType.UpdateConsignmentSucceeded:
    case ConsignmentActionType.DeleteConsignmentSucceeded:
    case ConsignmentActionType.UpdateShippingOptionSucceeded:
    case GiftCertificateActionType.ApplyGiftCertificateSucceeded:
    case GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        return objectMerge(data, omit(action.payload, [
            'billingAddress',
            'cart',
            'consignments',
            'customer',
            'coupons',
            'giftCertificates',
        ])) as CheckoutDataState;

    case OrderActionType.SubmitOrderSucceeded:
        return objectSet(data, 'orderId', action.payload && action.payload.order.orderId) ;

    default:
        return data;
    }
}

function errorsReducer(
    errors: CheckoutErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction | OrderAction
): CheckoutErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return objectSet(errors, 'loadError', undefined);

    case CheckoutActionType.LoadCheckoutFailed:
        return objectSet(errors, 'loadError', action.payload);

    case CheckoutActionType.UpdateCheckoutRequested:
    case CheckoutActionType.UpdateCheckoutSucceeded:
        return objectSet(errors, 'updateError', undefined);

    case CheckoutActionType.UpdateCheckoutFailed:
        return objectSet(errors, 'updateError', action.payload);

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: CheckoutStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction | OrderAction
): CheckoutStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return objectSet(statuses, 'isLoading', true);

    case CheckoutActionType.LoadCheckoutFailed:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return objectSet(statuses, 'isLoading', false);

    case CheckoutActionType.UpdateCheckoutRequested:
        return objectSet(statuses, 'isUpdating', true);

    case CheckoutActionType.UpdateCheckoutFailed:
    case CheckoutActionType.UpdateCheckoutSucceeded:
        return objectSet(statuses, 'isUpdating', false);

    default:
        return statuses;
    }
}
