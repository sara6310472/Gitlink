const dal = require('../services/genericDal');

const getItemByConditions = async (table, conditions = []) => {
  try {
    const res = await dal.GET(table, conditions);
    return res || null;
  } catch (error) {
    console.error(`Error fetching items from ${table}:`, error);
    throw new Error(`Failed to fetch items from ${table}`);
  }
};

const deleteItem = async (table, conditions = []) => {
  try {
    return await dal.DELETE(table, conditions);
  } catch (error) {
    console.error(`Error deleting item from ${table}:`, error);
    throw new Error(`Failed to delete item from ${table}`);
  }
};

const createItem = async (table, data) => {
  try {
    if (Array.isArray(data)) {
      data = Object.fromEntries(data.map(({ field, value }) => [field, value]));
    }
    return await dal.CREATE(table, data);
  } catch (error) {
    console.error(`Error creating item in ${table}:`, error);
    throw new Error(`Failed to create item in ${table}`);
  }
};

const updateItem = async (table, data, conditions = []) => {
  try {
    return await dal.UPDATE(table, data, conditions);
  } catch (error) {
    console.error(`Error updating item in ${table}:`, error);
    throw new Error(`Failed to update item in ${table}`);
  }
};

module.exports = {
  getItemByConditions,
  deleteItem,
  createItem,
  updateItem,
};