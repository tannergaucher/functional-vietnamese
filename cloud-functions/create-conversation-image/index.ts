import * as fs from "fs";
import * as util from "util";
import * as functions from "@google-cloud/functions-framework";
import OpenAI from "openai";
import { Storage } from "@google-cloud/storage";

import {
  CloudEventData,
  CreateConversationImageEvent,
  parseCloudEventData,
} from "@functional-vietnamese/cloud-function-events";

import { PrismaClient } from "./generated";

functions.cloudEvent(
  "createConversationImage",
  async (cloudEvent: functions.CloudEvent<CloudEventData>) => {
    const { conversationSituationId } =
      parseCloudEventData<CreateConversationImageEvent>({
        cloudEvent,
      });

    const prisma = new PrismaClient();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const storage = new Storage({
      projectId: "daily-vietnamese",
      keyFilename: "./service-account.json",
    });

    await createConversationImage({
      conversationSituationId,
      prisma,
      openai,
      storage,
    });
  }
);

export async function createConversationImage({
  conversationSituationId,
  prisma,
  openai,
  storage,
}: {
  conversationSituationId: string;
  prisma: PrismaClient;
  openai: OpenAI;
  storage: Storage;
}) {
  const conversationSituation =
    await prisma.conversationSituation.findUniqueOrThrow({
      where: {
        id: conversationSituationId,
      },
      select: {
        text: true,
        imageSrc: true,
      },
    });

  if (conversationSituation.imageSrc) {
    return;
  }

  const completion = await openai.images.generate({
    model: "dall-e-2",
    prompt: `A vividly colorful Vietnamese folk print of the following scene: ${conversationSituation.text}`,
    n: 1,
    size: "1024x1024",
  });

  if (completion.data[0].url) {
    const response = await fetch(completion.data[0].url);

    const blob = await response.blob();

    const writeFile = util.promisify(fs.writeFile);

    const imageFile = `${conversationSituationId}.webp`;

    const buffer = await blob.arrayBuffer();

    const uint8Array = new Uint8Array(buffer);

    writeFile(imageFile, uint8Array, "binary");

    const bucketName = `conversation-dalee-images`;

    const bucket = storage.bucket(bucketName);

    await bucket.upload(imageFile, {
      destination: `${conversationSituationId}.webp`,
    });

    const gcsUri = `https://storage.googleapis.com/${bucketName}/${conversationSituationId}.webp`;

    await prisma.conversationSituation.update({
      where: {
        id: conversationSituationId,
      },
      data: {
        imageSrc: gcsUri,
      },
    });
  }
}
