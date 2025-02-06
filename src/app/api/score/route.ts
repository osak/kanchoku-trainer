import { z } from "zod";
import { NextRequest } from "next/server";
import * as fs from "fs";
import { format } from "date-fns";

const missCountSchema = z.object({
  char: z.string().length(1), // 1文字の文字列
  missCount: z.number().int().nonnegative(), // 0以上の整数
});

const timeSchema = z.object({
  char: z.string().length(1), // 1文字の文字列
  time: z.number().int().nonnegative(), // 0以上の整数
});

const payloadSchema = z.object({
  missCounts: z.array(missCountSchema),
  times: z.array(timeSchema),
});

export async function POST(req: NextRequest) {
	const body = await req.json();
	const payload = payloadSchema.parse(body);

	// Format timestamp in yyyy-mm-dd_hhmmss Format
	const timestamp = format(new Date(), "yyyy-MM-dd_HHmmss");
	const filename = `result_${timestamp}.json`;

	fs.writeFileSync(`local/${filename}`, JSON.stringify(payload));

	// Return a json blob that contains the filename
	return new Response(JSON.stringify({ filename }), {
		headers: { "Content-Type": "application/json" },
	});
}
