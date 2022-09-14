var router = require('express').Router();
const { requiresAuth, auth } = require('express-openid-connect');

router.get('/', function (req, res, next) {
  let params = {
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: req.oidc.isAuthenticated()
  };
  if (params.isAuthenticated) 
  {
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
router.get("/payments", requiresAuth(), (req,res) => {
  res.render('payPage', {
    isAuthenticated: true,
    firstName: req.oidc.idTokenClaims.given_name,
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Payments'
  })
})

router.get("/loyaltyCard/:card",(req,res) => {
  res.oidc.login({
    authorizationParams: {
      connection: req.params.card
    },
    returnTo: "/profile"
  })
})

module.exports = router;
