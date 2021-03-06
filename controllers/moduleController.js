import fs from "fs";
import Module from "../models/ModuleModel.js";
import { createModuleValidation } from "../helpers/validation.js";

import util from "util";
const unlinkFile = util.promisify(fs.unlink);

import { uploadFile, deleteObject } from "../helpers/s3.js";

export const create = async (req, res) => {
  // Verify User if the user is Admin or not
  if (!req.user.isSuperuser)
    return res.status(403).json({
      status: 403,
      error: {
        message: "Forbidden Access!",
      },
    });

  // Validate the request
  const { error } = createModuleValidation(req.body);
  if (error)
    return res.status(401).json({
      status: 401,
      error: {
        message: error.details[0].message,
      },
    });

  const module = new Module({
    moduleNumber: req.body.moduleNumber,
    moduleTitle: req.body.title,
  });

  module
    .save()
    .then((result) => {
      res.status(201).json({
        status: 201,
        message: "Module created successfully.",
        results: result,
      });
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while creating data!",
        },
      });
    });
};

export const createTheory = async (req, res) => {
  // Verify User if the user is Admin or not
  if (!req.user.isSuperuser)
    return res.status(403).json({
      status: 403,
      error: {
        message: "Forbidden Access!",
      },
    });

  const id = req.params.id;

  // Upload Thumbnail Image
  let uploadImageResult;
  try {
    const image = req.files.image[0];
    uploadImageResult = await uploadFile(image);
    await unlinkFile(image.path);
  } catch (err) {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  }


  Module.findByIdAndUpdate(id, {
    $addToSet: {
      theory: [
        {
          moduleId: id,
          moduleNumber: req.body.moduleNumber,
          moduleTitle: req.body.moduleTitle,
          theoryNumber: req.body.theoryNumber,
          title: req.body.title,
          description: req.body.description,
          image: uploadImageResult.Location ? uploadImageResult.Location : "",
        },
      ],
    },
  })
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });

      res.status(201).json({
        status: 201,
        message: "Data updated successfuly.",
      });
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while updating data!",
        },
      });
    });
};

export const createLab = async (req, res) => {
  // Verify User if the user is Admin or not
  if (!req.user.isSuperuser)
    return res.status(403).json({
      status: 403,
      error: {
        message: "Forbidden Access!",
      },
    });

  const id = req.params.id;

  // Upload Images
  let uploadModelResult
  let uploadThumbnailResult
  try {
    const model = req.files.model[0];
    const thumbnail = req.files.thumbnail[0];
    uploadModelResult = await uploadFile(model);
    uploadThumbnailResult = await uploadFile(thumbnail);
    await unlinkFile(model.path);
    await unlinkFile(thumbnail.path);
  } catch (err) {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  }


  Module.findByIdAndUpdate(id, {
    $addToSet: {
      lab: [
        {
          moduleId: id,
          moduleNumber: req.body.moduleNumber,
          moduleTitle: req.body.moduleTitle,
          labNumber: req.body.labNumber,
          title: req.body.title,
          description: req.body.description,
          modelAR: uploadModelResult.Location ? uploadModelResult.Location : "",
          thumbnailAR: uploadThumbnailResult.Location ? uploadThumbnailResult.Location : "",
        },
      ],
    },
  })
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });

      res.status(201).json({
        status: 201,
        message: "Data updated successfuly.",
      });
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while updating data!",
        },
      });
    });
};

export const deleteModule = async (req, res) => {
  // Verify User if the user is Admin or not
  if (!req.user.isSuperuser)
    return res.status(403).json({
      status: 403,
      error: {
        message: "Forbidden Access!",
      },
    });

  const id = req.params.id;

  Module.findByIdAndDelete(id)
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });

      res.status(204).json({
        status: 204,
        message: "Data deleted successfully.",
      });

      result.theory.map((item) => {
        deleteObject(item.image.split('/').slice(-1)[0])
      })

      result.lab.map((item) => {
        deleteObject(item.modelAR.split('/').slice(-1)[0])
        deleteObject(item.thumbnailAR.split('/').slice(-1)[0])
      })
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while deleting data!",
        },
      });
    });
};

export const deleteTheory = async (req, res) => {
  // Verify User if the user is Admin or not
  if (!req.user.isSuperuser)
    return res.status(403).json({
      status: 403,
      error: {
        message: "Forbidden Access!",
      },
    });

  const id = req.params.id;
  const theoryId = req.params.theoryId;

  Module.findByIdAndUpdate(id, {
    $pull: {
      theory: { _id: theoryId },
    },
  })
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });

      res.status(201).json({
        status: 201,
        message: "Data deleted successfully.",
      });

      result.theory.map((item) => {
        if (item.id === theoryId) {
          // console.log(item.image.split('/').slice(-1)[0])
          deleteObject(item.image.split('/').slice(-1)[0])
        }
      })
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while updating data!",
        },
      });
    });
};

export const deleteLab = async (req, res) => {
  // Verify User if the user is Admin or not
  if (!req.user.isSuperuser)
    return res.status(403).json({
      status: 403,
      error: {
        message: "Forbidden Access!",
      },
    });

  const id = req.params.id;
  const labId = req.params.labId;

  Module.findByIdAndUpdate(id, {
    $pull: {
      lab: { _id: labId },
    },
  })
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });

      res.status(201).json({
        status: 201,
        message: "Data deleted successfuly.",
      });

      result.lab.map((item) => {
        if (item.id === labId) {
          deleteObject(item.modelAR.split('/').slice(-1)[0])
          deleteObject(item.thumbnailAR.split('/').slice(-1)[0])
        }
      })
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while updating data!",
        },
      });
    });
};

export const findAll = async (req, res) => {
  Module.find({}, { __v: 0, favoritedUsers: 0 })
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });
      res.status(200).json({
        status: 200,
        results: result,
      });
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while retrieving data!",
        },
      });
    });
};

export const findOne = async (req, res) => {
  const id = req.params.id;

  Module.findById(id, { __v: 0, favoritedUsers: 0 })
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });

      res.status(200).json({ results: result });
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while retrieving data!",
        },
      });
    });
};

export const updateModule = async (req, res) => {
  // Validate the request
  const { error } = createModuleValidation(req.body);
  if (error)
    return res.status(401).json({
      status: 401,
      error: {
        message: error.details[0].message,
      },
    });

  const id = req.params.id;

  Module.findByIdAndUpdate(id, {
    moduleNumber: req.body.moduleNumber,
    title: req.body.title
  })
    .then((result) => {
      if (!result)
        return res.status(404).json({
          status: 404,
          error: {
            message: "Data not found!",
          },
        });

      res.status(201).json({
        status: 201,
        message: "Data updated successfuly.",
      });
    })
    .catch((err) => {
      res.status(409).json({
        status: 409,
        error: {
          message: err.message || "Some error while updating data!",
        },
      });
    });
};

export const updateTheory = async (req, res) => {

  const theoryId = req.params.theoryId;

  // Upload Thumbnail Image
  let uploadResult;
  try {
    const file = req.files.image[0];
    uploadResult = await uploadFile(file);
    await unlinkFile(file.path);
  } catch (err) {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  }


  Module.findOne({ "theory._id": theoryId }).then((result) => {
    if (!result)
      return res.status(404).json({
        status: 404,
        error: {
          message: "Data not found!",
        },
      });

    let theory = result.theory.id(theoryId);

    theory.title = req.body.title
    theory.description = req.body.description
    theory.image = uploadResult.Location ? uploadResult.Location : ""

    result.save();
    res.status(201).json({
      status: 201,
      message: "Data updated successfuly.",
    });
  }).catch((err) => {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  });
};

export const updateLab = async (req, res) => {

  const labId = req.params.labId;


  let uploadModelResult;
  let uploadThumbnailResult;
  try {
    const model = req.files.model[0];
    const thumbnail = req.files.thumbnail[0];
    uploadModelResult = await uploadFile(model);
    uploadThumbnailResult = await uploadFile(thumbnail);
    await unlinkFile(model.path);
    await unlinkFile(thumbnail.path);
  } catch (err) {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  }

  Module.findOne({ "lab._id": labId }).then((result) => {
    if (!result)
      return res.status(404).json({
        status: 404,
        error: {
          message: "Data not found!",
        },
      });

    let lab = result.lab.id(labId);

    lab.title = req.body.title
    lab.description = req.body.description
    lab.modelAR = uploadModelResult.Location ? uploadModelResult.Location : ""
    lab.thumbnailAR = uploadThumbnailResult.Location ? uploadThumbnailResult.Location : ""

    result.save();
    res.status(201).json({
      status: 201,
      message: "Data updated successfuly.",
    });
  }).catch((err) => {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  });
};

export const getTheoryById = async (req, res) => {
  const theoryId = req.params.theoryId;

  Module.findOne({ "theory._id": theoryId }).then((result) => {
    if (!result)
      return res.status(404).json({
        status: 404,
        error: {
          message: "Data not found!",
        },
      });

    const theory = result.theory.id(theoryId);

    res.status(201).json({
      status: 201,
      result: theory,
    });
  }).catch((err) => {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  });
}

export const getLabById = async (req, res) => {
  const labId = req.params.labId;

  Module.findOne({ "lab._id": labId }).then((result) => {
    if (!result)
      return res.status(404).json({
        status: 404,
        error: {
          message: "Data not found!",
        },
      });

    const lab = result.lab.id(labId);

    res.status(201).json({
      status: 201,
      result: lab,
    });
  }).catch((err) => {
    res.status(409).json({
      status: 409,
      error: {
        message: err.message || "Some error while updating data!",
      },
    });
  });
}

