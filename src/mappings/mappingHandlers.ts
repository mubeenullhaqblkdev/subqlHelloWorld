import { Block, Message, Transaction, TransferEvent } from "../types";
import {
  TerraEvent,
  TerraBlock,
  TerraMessage,
  TerraTransaction,
} from "@subql/types-terra";
import { MsgExecuteContract } from "@terra-money/terra.js";

export async function handleBlock(block: TerraBlock): Promise<void> {
  const record = new Block(block.block.block_id.hash);
  record.height = BigInt(block.block.block.header.height);
  await record.save();
}

export async function handleTransaction(tx: TerraTransaction): Promise<void> {
  const record = new Transaction(tx.tx.txhash);
  record.blockHeight = BigInt(tx.block.block.block.header.height);
  record.timestamp = tx.tx.timestamp;
  await record.save();
}

export async function handleEvent(
  event: TerraEvent<MsgExecuteContract>
): Promise<void> {
  // Print debugging data from the event
  // logger.info(JSON.stringify(event));
    
  // Create the new transfer entity with a unique ID
  const record = new TransferEvent(
    `${event.tx.tx.txhash}-${event.msg.idx}-${event.idx}`
  );
  record.blockHeight = BigInt(event.block.block.block.header.height);
  record.txHash = event.tx.tx.txhash;
  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case "sender":
        record.sender = attr.value;
        break;
      case "recipient":
        record.recipient = attr.value;
        break;
      case "amount":
        record.amount = attr.value;
        break;
      default:
    }
  }
  await record.save();
}
