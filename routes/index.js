var router = require('express').Router();
const { requiresAuth, auth } = require('express-openid-connect');
const fetch = require("node-fetch");

router.get('/', function (req, res, next) {
  let params = {
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: req.oidc.isAuthenticated()
  };
  if (params.isAuthenticated) {
    params.firstName = req.oidc.idTokenClaims.given_name;
  }
  res.render('index', params);
});

router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    isAuthenticated: true,
    firstName: req.oidc.idTokenClaims.given_name,
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});
router.get("/payments", requiresAuth(), (req, res) => {
  res.render('payPage', {
    isAuthenticated: true,
    firstName: req.oidc.idTokenClaims.given_name,
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Payments'
  })
})
router.get("/checkin", requiresAuth(), (req, res) => {
  res.render('checkIn', {
    isAuthenticated: true,
    firstName: req.oidc.idTokenClaims.given_name,
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Check-In'
  })
})

router.get("/loyaltyCard/:card", (req, res) => {
  res.oidc.login({
    authorizationParams: {
      connection: req.params.card
    },
    returnTo: "/profile"
  })
})
router.get("/api/orders", async (req, res) => {
  if (!req.oidc.accessToken) res.status(403).send("Not authorized!");
  else {
    const orders = await getOrdersForUser(req.oidc.accessToken.access_token, req.oidc.user.sub);
    res.send(orders);
  }
})




async function getOrdersForUser(accessToken, userid) {
  return new Promise(async resolve => {
    const request = await fetch("https://cic-retail-cache-service.herokuapp.com/api/user/" + userid + "/orders", {
      headers: {
        "Authorization": "Bearer " + accessToken
      }
    }).catch(e => { console.error(e) });
    const body = await request.json().catch(e => { console.error(e); return {} });
    const orders = body.orders;
    let orderQueries = [];
    orders.forEach(async order => {
      orderQueries.push(fetchOrder(order.order_id, accessToken));
    })
    Promise.all(orderQueries).then(finalOrders => {
      resolve(finalOrders);
    })
    
  })

}

async function fetchOrder(orderId, accessToken) {
  const query = await fetch("https://cic-retail-cache-service.herokuapp.com/api/order/" + orderId, {
    headers: {
      "Authorization": "Bearer " + accessToken
    }
  });
  const json = await query.json();
  return json;
}

module.exports = router;
