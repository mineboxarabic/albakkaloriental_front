// Keep browser tests independent of Google Fonts availability.
module.exports = new Proxy({}, {
  get: () => "@font-face { font-family: 'Poppins'; src: local('Arial'); font-style: normal; font-weight: 100 900; }",
});
