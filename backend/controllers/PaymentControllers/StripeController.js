import Stripe from 'stripe';
import dynamodb from '../../config/dbConfig.js'
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const tableName = 'vairo-table';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getPriceId = (plan) => {
    return process.env[`STRIPE_PRICE_ID_${plan.toUpperCase()}`];
}

const getAnnualPriceId = (plan) => {
    const planUpper = plan.toUpperCase().replace('MONTHLY', 'ANNUAL');
    const annPlan = process.env[`STRIPE_PRICE_ID_${planUpper}`];
    return annPlan;
}

const getSubscriptionType = ({ plan }) => {
    return plan.split('_')[0];
}

export const createCheckoutSession = async (req, res) => {
    const { plan, workspaceId } = req.body;
    const priceId = getPriceId(plan);
    const subType = getSubscriptionType({ plan: plan });

    console.log("subType:", subType);
    console.log("workspaceId:", workspaceId);

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
              {
                price: priceId,
                quantity: 1,
              },
            ],
            ui_mode: 'embedded',
            allow_promotion_codes: true, // Optional: Enable promo codes
            metadata: {
                workspaceId: workspaceId,
                subscriptionType: subType
             },
            return_url: `${process.env.APP_URL}/upgrade/stripe-return/?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`
        });

        res.send({clientSecret: session.client_secret});
    } catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
}

export const sessionStatus = async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const customer = await stripe.customers.retrieve(session.customer);

    res.send({
        status: session.status,
        payment_status: session.payment_status,
        customer_email: customer.email
    });
}

export const handleStripeWebhook = async (req, res) => {
    const event = req.body;

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent);
            handlePaymentIntentSucceeded(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const paymentFailedIntent = event.data.object;
            console.log('PaymentIntent failed!', paymentFailedIntent);
            // Handle failed payment here
            break;
        // Add more event types as needed
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
}


function handlePaymentIntentSucceeded(paymentIntent) {
    // Extract workspace ID and subscription type from paymentIntent metadata
    const workspaceId = paymentIntent.metadata.workspaceId;
    const subscriptionType = paymentIntent.metadata.subscriptionType;

    console.log("subscriptionType:", subscriptionType);
    console.log("workspaceId:", workspaceId);

    // Update the workspace in the database
    const params = {
        TableName: tableName,
        Key: {
            'PK': `WORKSPACE#${workspaceId}`,
            'SK': 'METADATA'
        },
        UpdateExpression: 'set subscriptionType = :subscriptionType',
        ExpressionAttributeValues: {
            ':subscriptionType': subscriptionType
        },
        ReturnValues: 'UPDATED_NEW'
    };

    const command = new UpdateCommand(params);

    dynamodb.send(command)
        .then(data => {
            console.log("Update succeeded:", JSON.stringify(data, null, 2));
        })
        .catch(err => {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        });
}


