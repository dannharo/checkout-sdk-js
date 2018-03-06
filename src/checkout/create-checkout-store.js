import { createDataStore } from '@bigcommerce/data-store';
import { CacheFactory } from '../common/cache';
import { cartReducer, CartSelector } from '../cart';
import { CheckoutErrorSelector, CheckoutSelector, CheckoutStatusSelector } from '../checkout';
import { configReducer, ConfigSelector } from '../config';
import { countryReducer, CountrySelector } from '../geography';
import { createFreezeProxy } from '../common/utility';
import { createRequestErrorFactory } from '../common/error';
import { customerReducer, CustomerSelector } from '../customer';
import { couponReducer, CouponSelector, giftCertificateReducer, GiftCertificateSelector } from '../coupon';
import { FormSelector } from '../form';
import { orderReducer, OrderSelector } from '../order';
import { paymentReducer, paymentMethodReducer, PaymentMethodSelector } from '../payment';
import { remoteCheckoutReducer, RemoteCheckoutSelector } from '../remote-checkout';
import { instrumentReducer, InstrumentSelector } from '../payment/instrument';
import { quoteReducer, QuoteSelector } from '../quote';
import { BillingAddressSelector } from '../billing';
import {
    ShippingSelector,
    ShippingAddressSelector,
    ShippingCountrySelector,
    ShippingOptionSelector,
    shippingReducer,
    shippingCountryReducer,
    shippingOptionReducer,
} from '../shipping';
import createActionTransformer from './create-action-transformer';

/**
 * @param {Object} [initialState={}]
 * @param {Object} [options={}]
 * @return {DataStore}
 */
export default function createCheckoutStore(initialState = {}, options = {}) {
    const cacheFactory = new CacheFactory();
    const actionTransformer = createActionTransformer(createRequestErrorFactory());
    const stateTransformer = (state) => createCheckoutSelectors(state, cacheFactory, options);

    return createDataStore(
        createCheckoutReducers(),
        initialState,
        { actionTransformer, stateTransformer, ...options }
    );
}

/**
 * @private
 * @return {CheckoutReducers}
 */
function createCheckoutReducers() {
    return {
        cart: cartReducer,
        config: configReducer,
        countries: countryReducer,
        coupons: couponReducer,
        customer: customerReducer,
        giftCertificates: giftCertificateReducer,
        instruments: instrumentReducer,
        order: orderReducer,
        payment: paymentReducer,
        paymentMethods: paymentMethodReducer,
        quote: quoteReducer,
        remoteCheckout: remoteCheckoutReducer,
        shipping: shippingReducer,
        shippingCountries: shippingCountryReducer,
        shippingOptions: shippingOptionReducer,
    };
}

/**
 * @private
 * @param {CheckoutState} state
 * @param {CacheFactory} cacheFactory
 * @param {Object} [options={}]
 * @param {boolean} [options.shouldWarnMutation=true]
 * @return {CheckoutSelectors}
 */
function createCheckoutSelectors(state, cacheFactory, options) {
    const billingAddress = new BillingAddressSelector(state.quote);
    const cart = new CartSelector(state.cart);
    const config = new ConfigSelector(state.config);
    const countries = new CountrySelector(state.countries);
    const coupon = new CouponSelector(state.coupons);
    const customer = new CustomerSelector(state.customer);
    const form = new FormSelector(state.config);
    const giftCertificate = new GiftCertificateSelector(state.giftCertificates);
    const instruments = new InstrumentSelector(state.instruments);
    const order = new OrderSelector(state.order, state.payment, state.customer, state.cart, cacheFactory);
    const paymentMethods = new PaymentMethodSelector(state.paymentMethods, state.order);
    const quote = new QuoteSelector(state.quote);
    const remoteCheckout = new RemoteCheckoutSelector(state.remoteCheckout);
    const shipping = new ShippingSelector(state.shipping);
    const shippingAddress = new ShippingAddressSelector(state.quote);
    const shippingCountries = new ShippingCountrySelector(state.shippingCountries);
    const shippingOptions = new ShippingOptionSelector(state.shippingOptions, state.quote);

    const checkout = new CheckoutSelector(
        billingAddress,
        cart,
        config,
        countries,
        customer,
        form,
        instruments,
        order,
        paymentMethods,
        quote,
        remoteCheckout,
        shippingAddress,
        shippingCountries,
        shippingOptions,
        cacheFactory
    );

    const errors = new CheckoutErrorSelector(
        billingAddress,
        cart,
        config,
        countries,
        coupon,
        customer,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        quote,
        shipping,
        shippingAddress,
        shippingCountries,
        shippingOptions
    );

    const statuses = new CheckoutStatusSelector(
        billingAddress,
        cart,
        config,
        countries,
        coupon,
        customer,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        quote,
        remoteCheckout,
        shipping,
        shippingAddress,
        shippingCountries,
        shippingOptions
    );

    return {
        checkout: options.shouldWarnMutation ? createFreezeProxy(checkout) : checkout,
        errors: options.shouldWarnMutation ? createFreezeProxy(errors) : errors,
        statuses: options.shouldWarnMutation ? createFreezeProxy(statuses) : statuses,
    };
}