/**
 * Type Definitions
 * 
 * This file contains shared TypeScript type definitions used across the application.
 */

/**
 * Represents a tree structure item for file/folder hierarchies
 * 
 * @example
 * // A simple file
 * "README.md"
 * 
 * // A folder with nested items
 * ["src", "components", "Button.tsx", "index.ts"]
 * 
 * // Complex nested structure
 * [
 *   "src", 
 *   ["components", "Button.tsx", "Modal.tsx"],
 *   ["utils", "helpers.ts"],
 *   "index.ts"
 * ]
 */
export type TreeItem = string | [string, ...TreeItem[]];