// Utilidad para serializar datos de Prisma con BigInt y Decimal
export function serializePrismaData<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  )
}
