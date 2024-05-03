import fs from "fs";
import path from "path";
import {
  createLanguageModel,
  createJsonTranslator,
  TypeChatLanguageModel,
} from "typechat";
import { PubSub } from "@google-cloud/pubsub";
import * as functions from "@google-cloud/functions-framework";

import { PrismaClient } from "./generated";
import { ConversationSituationResponse } from "./conversationSituation";

functions.cloudEvent("createConversationSituation", async () => {
  const model = createLanguageModel(process.env);
  const prisma = new PrismaClient();

  const pubsub = new PubSub({
    projectId: "daily-vietnamese",
    keyFilename: "./service-account.json",
  });

  const response = await createConversationSituation({ prisma, model, pubsub });

  return response;
});

export async function createConversationSituation({
  prisma,
  model,
  pubsub,
}: {
  prisma: PrismaClient;
  model: TypeChatLanguageModel;
  pubsub: PubSub;
}) {
  const schema = fs.readFileSync(
    path.join(__dirname, "conversationSituation.ts"),
    "utf-8"
  );

  const translator = createJsonTranslator<ConversationSituationResponse>(
    model,
    schema,
    "ConversationSituationResponse"
  );

  const prevConversations = await prisma.conversationSituation.findMany();

  const conversationSituationTypes: ConversationSituationResponse["type"][] = [
    "at the restaurant",
    "at the cafe",
    "at the street food vendor stall",
    "at the market",
    "asking a local for directions",
    "a health related situation",
    "an emergency situation",
    "at the hotel",
    "shopping at a store",
  ];

  const randomIndex = Math.floor(
    Math.random() * conversationSituationTypes.length
  );

  const conversationSituationType: ConversationSituationResponse["type"] =
    conversationSituationTypes[randomIndex];

  const response = await translator.translate(
    `Create a new conversation situation for an application we are building to help me practice Vietnamese language. The application will generate a conversation dialog based on the situation. The conversation situation should take place in the the the context of the following situation: ${conversationSituationType}. The conversation situation should be a short description of a scenario that is likely to happen in the course of a normal day in Vietnam. For example, for type: at the restaurant, the text could be something like: ordering phở chiên phồng from a street vendor in Hanoi. The conversation situation should be in English. The conversation situation should be unique and not a duplicate of any existing conversation situation. Here are the previously created conversation situations. Please do not repeat these! ${prevConversations
      .map((c) => c.text)
      .join(", ")}.`
  );

  if (response.success) {
    await prisma.conversationSituation
      .create({
        data: {
          text: response.data.text,
          type: conversationSituationType,
        },
      })
      .catch(() => {
        console.log("collision on text, trying again");
        pubsub.topic("create-conversation-situation").publishMessage({});
      });
  }
}
