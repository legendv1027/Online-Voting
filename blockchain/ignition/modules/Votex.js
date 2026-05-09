const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VotexModule", (m) => {
  const votex = m.contract("Votex");

  return { votex };
});
