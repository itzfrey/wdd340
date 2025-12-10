const pool = require("../database/")

/* ***************************
 *  Get all APPROVED classification data for navigation
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification WHERE classification_approved = TRUE ORDER BY classification_name")
}

/* ***************************
 *  Get ALL classifications (for admin use)
 * ************************** */
async function getAllClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get only APPROVED classifications (for add inventory dropdown)
 * ************************** */
async function getApprovedClassifications(){
  return await pool.query("SELECT * FROM public.classification WHERE classification_approved = TRUE ORDER BY classification_name")
}

/* ***************************
 *  Get all APPROVED inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1 AND i.inv_approved = TRUE AND c.classification_approved = TRUE`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get a single vehicle by inv_id (approved or not - for admin editing)
 * ************************** */
async function getVehicleByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleByInvId error " + error)
  }
}

/* ***************************
 *  Check if classification name already exists
 * ************************** */
async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE LOWER(classification_name) = LOWER($1)"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount > 0
  } catch (error) {
    console.error("checkExistingClassification error: " + error)
    return false
  }
}

/* ***************************
 *  Add new classification (unapproved by default)
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name, classification_approved) VALUES ($1, FALSE) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Add new inventory item (unapproved by default)
 * ************************** */
async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
) {
  try {
    const sql = `INSERT INTO inventory 
      (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_approved) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE) RETURNING *`
    return await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    ])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id,
  inv_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory Error: " + error)
  }
}

/* ***************************
 *  Get pending (unapproved) classifications
 * ************************** */
async function getPendingClassifications() {
  try {
    const data = await pool.query(
      `SELECT c.*, 
        COUNT(i.inv_id) as inventory_count
       FROM public.classification c
       LEFT JOIN public.inventory i ON c.classification_id = i.classification_id
       WHERE c.classification_approved = FALSE
       GROUP BY c.classification_id
       ORDER BY c.classification_name`
    )
    return data.rows
  } catch (error) {
    console.error("getPendingClassifications error: " + error)
    return []
  }
}

/* ***************************
 *  Get pending (unapproved) inventory items
 * ************************** */
async function getPendingInventory() {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name
       FROM public.inventory i
       JOIN public.classification c ON i.classification_id = c.classification_id
       WHERE i.inv_approved = FALSE
       ORDER BY i.inv_year DESC, i.inv_make, i.inv_model`
    )
    return data.rows
  } catch (error) {
    console.error("getPendingInventory error: " + error)
    return []
  }
}

/* ***************************
 *  Approve classification
 * ************************** */
async function approveClassification(classification_id, account_id) {
  try {
    const sql = `UPDATE public.classification 
                 SET classification_approved = TRUE, 
                     classification_approved_by = $1, 
                     classification_approval_date = NOW() 
                 WHERE classification_id = $2 RETURNING *`
    const data = await pool.query(sql, [account_id, classification_id])
    return data.rows[0]
  } catch (error) {
    console.error("approveClassification error: " + error)
    return null
  }
}

/* ***************************
 *  Approve inventory item
 * ************************** */
async function approveInventory(inv_id, account_id) {
  try {
    const sql = `UPDATE public.inventory 
                 SET inv_approved = TRUE, 
                     inv_approved_by = $1, 
                     inv_approved_date = NOW() 
                 WHERE inv_id = $2 RETURNING *`
    const data = await pool.query(sql, [account_id, inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("approveInventory error: " + error)
    return null
  }
}

/* ***************************
 *  Reject (delete) classification and all its inventory
 * ************************** */
async function rejectClassification(classification_id) {
  try {
    // First delete all inventory in this classification
    await pool.query("DELETE FROM public.inventory WHERE classification_id = $1", [classification_id])
    // Then delete the classification
    const sql = "DELETE FROM public.classification WHERE classification_id = $1"
    const data = await pool.query(sql, [classification_id])
    return data
  } catch (error) {
    console.error("rejectClassification error: " + error)
    return null
  }
}

/* ***************************
 *  Reject (delete) inventory item
 * ************************** */
async function rejectInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("rejectInventory error: " + error)
    return null
  }
}

/* ***************************
 *  Check if classification is approved
 * ************************** */
async function isClassificationApproved(classification_id) {
  try {
    const data = await pool.query(
      "SELECT classification_approved FROM public.classification WHERE classification_id = $1",
      [classification_id]
    )
    return data.rows[0]?.classification_approved || false
  } catch (error) {
    console.error("isClassificationApproved error: " + error)
    return false
  }
}

module.exports = {
  getClassifications, 
  getAllClassifications,
  getApprovedClassifications,
  getInventoryByClassificationId, 
  getVehicleByInvId, 
  addClassification, 
  checkExistingClassification,
  addInventory,
  updateInventory,
  deleteInventory,
  getPendingClassifications,
  getPendingInventory,
  approveClassification,
  approveInventory,
  rejectClassification,
  rejectInventory,
  isClassificationApproved
}