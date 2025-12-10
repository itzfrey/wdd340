const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

/* ***************************
 *  Build approval management view
 * ************************** */
async function buildApprovalView(req, res, next) {
  let nav = await utilities.getNav()
  const pendingClassifications = await invModel.getPendingClassifications()
  const pendingInventory = await invModel.getPendingInventory()
  
  res.render("admin/approvals", {
    title: "Pending Approvals",
    nav,
    pendingClassifications,
    pendingInventory,
    errors: null,
  })
}

/* ***************************
 *  Approve classification
 * ************************** */
async function approveClassification(req, res) {
  const classification_id = parseInt(req.params.id)
  const account_id = res.locals.accountData.account_id
  
  const result = await invModel.approveClassification(classification_id, account_id)
  
  if (result) {
    req.flash("notice", `Classification "${result.classification_name}" has been approved and is now live.`)
  } else {
    req.flash("notice", "Sorry, the approval failed.")
  }
  
  res.redirect("/admin/approvals")
}

/* ***************************
 *  Approve inventory item
 * ************************** */
async function approveInventory(req, res) {
  const inv_id = parseInt(req.params.id)
  const account_id = res.locals.accountData.account_id
  
  const result = await invModel.approveInventory(inv_id, account_id)
  
  if (result) {
    req.flash("notice", `Vehicle "${result.inv_year} ${result.inv_make} ${result.inv_model}" has been approved and is now live.`)
  } else {
    req.flash("notice", "Sorry, the approval failed.")
  }
  
  res.redirect("/admin/approvals")
}

/* ***************************
 *  Reject (delete) classification
 * ************************** */
async function rejectClassification(req, res) {
  const classification_id = parseInt(req.params.id)
  
  const result = await invModel.rejectClassification(classification_id)
  
  if (result) {
    req.flash("notice", "Classification and all its inventory have been rejected and deleted.")
  } else {
    req.flash("notice", "Sorry, the rejection failed.")
  }
  
  res.redirect("/admin/approvals")
}

/* ***************************
 *  Reject (delete) inventory item
 * ************************** */
async function rejectInventory(req, res) {
  const inv_id = parseInt(req.params.id)
  
  const result = await invModel.rejectInventory(inv_id)
  
  if (result) {
    req.flash("notice", "Vehicle has been rejected and deleted.")
  } else {
    req.flash("notice", "Sorry, the rejection failed.")
  }
  
  res.redirect("/admin/approvals")
}

module.exports = {
  buildApprovalView,
  approveClassification,
  approveInventory,
  rejectClassification,
  rejectInventory
}