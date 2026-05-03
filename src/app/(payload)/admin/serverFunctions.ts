'use server'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import config from '@payload-config'
import { importMap } from './importMap'
import type { ServerFunctionClientArgs } from 'payload'

export async function serverFunction(args: ServerFunctionClientArgs) {
  return handleServerFunctions({ ...args, config, importMap })
}
