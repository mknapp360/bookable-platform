import { render } from 'vike/abort'
import { getSector, getLocation } from '../../../src/data/seo-locations'
import type { Sector, Location } from '../../../src/data/seo-locations'

export type Data = {
  sector: Sector
  location: Location
}

export async function data(pageContext: {
  routeParams: { sector: string; location: string }
}): Promise<Data> {
  const { sector: sectorSlug, location: locationSlug } = pageContext.routeParams

  const sector = getSector(sectorSlug)
  const location = getLocation(locationSlug)

  if (!sector || !location) {
    throw render(404, 'Page not found')
  }

  return { sector, location }
}
