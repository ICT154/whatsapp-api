const whatsapp = require("wa-multi-session");
const ValidationError = require("../../utils/error");
const { responseSuccessWithData } = require("../../utils/response");

exports.sendMessage = async (req, res, next) => {
  try {
    let to = req.body.to || req.query.to;
    let text = req.body.text || req.query.text;
    let isGroup = req.body.isGroup || req.query.isGroup;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;

    if (!to || !text) throw new ValidationError("Missing Parameters");

    const receiver = to;
    if (!sessionId) throw new ValidationError("Session Not Founds");
    const send = await whatsapp.sendTextMessage({
      sessionId,
      to: receiver,
      isGroup: !!isGroup,
      text,
    });

    res.status(200).json(
      responseSuccessWithData({
        id: send?.key?.id,
        status: send?.status,
        message: send?.message?.extendedTextMessage?.text || "Not Text",
        remoteJid: send?.key?.remoteJid,
      })
    );
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send message",
        details: error.message,
      },
    });
  }
};

///// SEND GAMBAR
exports.sendImage = async (req, res, next) => {
  try {
    const to = req.body.to || req.query.to;
    const caption = req.body.caption || req.query.caption;
    const url = req.body.url || req.query.url;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;

    if (!to || !url) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Missing Parameters",
        },
      });
    }

    // console.log("Tipe data dari url:", typeof url);
    const send = await whatsapp.sendImage({
      sessionId: sessionId,
      to: to,
      text: caption,
      media: url,
    });

    if (send.status === 200) {
      res.status(200).json({
        status: true,
        data: {
          id: send?.key?.id,
          status: send?.status,
          message: send?.message?.extendedTextMessage?.text || "Not Text",
          remoteJid: send?.key?.remoteJid,
        },
      });
    } else {
      res.status(200).json({
        status: true,
        data: {
          id: send?.key?.id,
          status: send?.status,
          message: send?.message?.extendedTextMessage?.text || "Not Text",
          remoteJid: send?.key?.remoteJid,
        },
      });
    }

    // const send = await whatsapp.sendImage({
    //   sessionId,
    //   to: to,
    //   url: url,
    //   caption: caption,
    // });

    // if (sender.status === 200) {
    //   res.status(200).json({
    //     status: true,
    //     data: {
    //       id: send?.key?.id,
    //       status: send?.status,
    //       message: send?.message?.extendedTextMessage?.text || "Not Text",
    //       remoteJid: send?.key?.remoteJid,
    //     },
    //   });
    // }

  } catch (error) {
    console.error("Error sending image:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send image",
        details: error.message,
      },
    });
  }
};

exports.sendBulkMessage = async (req, res, next) => {
  try {
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const delay = req.body.delay || req.query.delay || req.headers.delay;
    if (!sessionId) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Session Not Found",
        },
      });
    }
    res.status(200).json({
      status: true,
      data: {
        message: "Bulk Message is Processing",
      },
    });
    for (const dt of req.body.data) {
      const to = dt.to;
      const text = dt.text;
      const isGroup = !!dt.isGroup;

      await whatsapp.sendTextMessage({
        sessionId,
        to: to,
        isGroup: isGroup,
        text: text,
      });
      await whatsapp.createDelay(delay ?? 1000);
    }
    console.log("SEND BULK MESSAGE WITH DELAY SUCCESS");
  } catch (error) {
    console.error("Error sending bulk message:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send bulk message",
        details: error.message,
      },
    });
  }
};

// SEND DOCUMENT
exports.sendDocument = async (req, res, next) => {
  try {
    const to = req.body.to || req.query.to;
    const caption = req.body.caption || req.query.caption;
    const url = req.body.url || req.query.url;
    const sessionId =
      req.body.session || req.query.session || req.headers.session;
    const filename = req.body.filename || req.query.filename || req.headers.filename;

    if (!to || !url) {
      return res.status(400).json({
        status: false,
        data: {
          error: "Missing Parameters",
        },
      });
    }

    // console.log("Tipe data dari url:", typeof url);
    const send = await whatsapp.sendDocument({
      sessionId: sessionId,
      to: to,
      filename: filename,
      media: url,
      text: caption,
    });

    if (send.status === 200) {
      res.status(200).json({
        status: true,
        data: {
          id: send?.key?.id,
          status: send?.status,
          message: send?.message?.extendedTextMessage?.text || "Not Text",
          remoteJid: send?.key?.remoteJid,
        },
      });
    } else {
      res.status(200).json({
        status: true,
        data: {
          id: send?.key?.id,
          status: send?.status,
          message: send?.message?.extendedTextMessage?.text || "Not Text",
          remoteJid: send?.key?.remoteJid,
        },
      });
    }
  } catch (error) {
    console.error("Error sending document:", error);
    res.status(500).json({
      status: false,
      data: {
        error: "Failed to send document",
        details: error.message,
      },
    });
  }
};

