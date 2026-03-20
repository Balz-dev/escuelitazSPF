type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean } | ClassValue[]

/**
 * Utilidad recursiva para fusionar condicionalmente clases CSS.
 * Ideal para trabajar con CSS Modules.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(input.toString())
    } else if (Array.isArray(input)) {
      const inner = cn(...input)
      if (inner) classes.push(inner)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}
