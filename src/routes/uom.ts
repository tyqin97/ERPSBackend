import e, { Router } from "express";
import moment from "moment";
import { SP_Category } from "../entity/SP_Category";
import { getConnection, getManager, Like } from "typeorm";
import { StandardParts } from "../entity/SP";
import { SP_TypeItems } from "../entity/SP_TypeItem";
import { LoggerService } from "../LoggerService";
import { PendingParts } from "../entity/SP_Pending";
import { ActivityLog } from "../entity/ActivityLog";
import { User } from "../entity/User";
import argon2 from "argon2";
import { SP_UomTypes } from "../entity/SP_Uom";

const logger = new LoggerService("uom-api");
const SPUOMRouter = Router();
const UOMManager = getManager("standardPartsDB");

SPUOMRouter.get("/", async (_req, res) => {
  res.send("Connect To UOM Successfully.");
});

SPUOMRouter.get("/getAllUOM", async (_req, res) => {
  try {
    await UOMManager.createQueryBuilder(SP_UomTypes, "UOM")
      .select(["UOM.id", "UOM.uom_type"])
      .where("status = 1")
      .getRawMany()
      .then((data) => {
        logger.info_obj("API: " + "/getAllUOM", {
          message: "API Done",
          total: data.length,
          status: true
        });
        res.send({ data, total: data.length, status: true });
      })
      .catch((e) => {
        logger.error_obj("API: " + "/getAllUOM", {
          message: "API Error: " + e,
          status: false
        });
        res.send({ message: e, status: false });
      });
  } catch (e) {
    logger.error_obj("API: " + "/getAllUOM", {
      message: "API Failed: " + e,
      status: false
    });
    res.send({ message: e, status: false });
  }
});

SPUOMRouter.post("/addUOM", async (req, res) => {
  const { uom_name } = req.body;
  try {
    const checkDuplicate = await UOMManager.findOne(SP_UomTypes, {
      uom_type: uom_name
    });

    if (checkDuplicate !== undefined) {
      logger.error_obj("API: " + "/addUOM", {
        message: "API Error: " + `Redundant on UOM ${uom_name}.`,
        value: uom_name,
        status: false
      });
      return res.send({
        message: `Redundant on UOM ${uom_name}.`,
        status: false
      });
    }

    const mainResult = {
      uom_type: uom_name,
      status: 1
    };

    await UOMManager.insert(SP_UomTypes, mainResult)
      .then((data) => {
        logger.info_obj("API: " + "/addUOM", {
          message: "API Done",
          value: uom_name,
          status: true
        });
        res.send({ data, value: uom_name, status: true });
      })
      .catch((e) => {
        logger.error_obj("API: " + "/addUOM", {
          message: "API Error: " + e,
          status: false
        });
        res.send({ message: e, status: false });
      });
  } catch (e) {
    logger.error_obj("API: " + "/addUOM", {
      message: "API Failed: " + e,
      status: false
    });
    res.send({ message: e, status: false });
  }
});

SPUOMRouter.post("/editUOM", async (req, res) => {
  const { id, uom_type } = req.body;
  try {
    await UOMManager.update(
      SP_UomTypes,
      { id },
      {
        uom_type
      }
    )
      .then((data) => {
        logger.info_obj("API: " + "/editUOM", {
          message: "API Done",
          value: data,
          status: true
        });
        res.send({ data, value: data, status: true });
      })
      .catch((e) => {
        logger.error_obj("API: " + "/editUOM", {
          message: "API Error: " + e,
          status: false
        });
        res.send({ message: e, status: false });
      });
  } catch (e) {
    logger.error_obj("API: " + "/editUOM", {
      message: "API Failed: " + e,
      status: false
    });
    res.send({ message: e, status: false });
  }
});

SPUOMRouter.post("/deleteUOM", async (req, res) => {});

SPUOMRouter.post("/recoverUOM", async (req, res) => {});

module.exports = SPUOMRouter;
