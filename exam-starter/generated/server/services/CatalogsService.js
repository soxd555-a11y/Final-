/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* รายการ catalog (ค้นหา + แบ่งหน้า)
*
* q String  (optional)
* page Integer  (optional)
* limit Integer  (optional)
* all Boolean ส่ง true เพื่อดึงทั้งหมดแบบไม่แบ่งหน้า (ใช้เติม dropdown) (optional)
* returns _api_catalogs_get_200_response
* */
const apiCatalogsGET = ({ q, page, limit, all }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        q,
        page,
        limit,
        all,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* ลบ catalog (ลบไม่ได้ถ้ายังมีหนังสือ)
*
* id Integer 
* no response value expected for this operation
* */
const apiCatalogsIdDELETE = ({ id }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* ดู catalog ตาม id
*
* id Integer 
* no response value expected for this operation
* */
const apiCatalogsIdGET = ({ id }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* แก้ไข catalog
*
* id Integer 
* catalogInput CatalogInput 
* no response value expected for this operation
* */
const apiCatalogsIdPUT = ({ id, catalogInput }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        id,
        catalogInput,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* เพิ่ม catalog
*
* catalogInput CatalogInput 
* no response value expected for this operation
* */
const apiCatalogsPOST = ({ catalogInput }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        catalogInput,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  apiCatalogsGET,
  apiCatalogsIdDELETE,
  apiCatalogsIdGET,
  apiCatalogsIdPUT,
  apiCatalogsPOST,
};
