/**
 * Retry utility with exponential backoff for Supabase operations
 * Handles transient network errors and timeouts
 */

interface RetryOptions {
    maxRetries?: number
    initialDelayMs?: number
    maxDelayMs?: number
    timeoutMs?: number
}

interface RetryableError extends Error {
    code?: string
    status?: number
}

/**
 * Checks if an error is transient and should be retried
 */
function isRetryableError(error: any): boolean {
    // Network errors
    if (error.message?.includes("ETIMEDOUT")) return true
    if (error.message?.includes("ECONNRESET")) return true
    if (error.message?.includes("ENOTFOUND")) return true
    if (error.message?.includes("fetch failed")) return true

    // HTTP status codes that indicate transient errors
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504]
    if (error.status && retryableStatusCodes.includes(error.status)) return true

    // PostgreSQL/Supabase specific errors
    if (error.code === "PGRST301") return true // Query timeout
    if (error.code === "08006") return true // Connection failure
    if (error.code === "08003") return true // Connection does not exist
    if (error.code === "57000") return true // Operator intervention
    if (error.code === "57P03") return true // Cannot connect now

    return false
}

/**
 * Executes an async function with retry logic and exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelayMs = 1000,
        maxDelayMs = 10000,
        timeoutMs = 30000,
    } = options

    let lastError: Error | null = null
    let delay = initialDelayMs

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Wrap in timeout promise
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Operation timeout")), timeoutMs)
            )

            const result = await Promise.race([fn(), timeoutPromise])

            if (attempt > 0) {
                console.log(`✅ Operation succeeded on attempt ${attempt + 1}`)
            }

            return result
        } catch (error: any) {
            lastError = error

            // Don't retry on last attempt
            if (attempt === maxRetries) {
                console.error(`❌ All ${maxRetries + 1} attempts failed:`, error.message)
                throw error
            }

            // Check if error is retryable
            if (!isRetryableError(error)) {
                console.error("Non-retryable error encountered:", error.message)
                throw error
            }

            // Log retry attempt
            console.warn(`⚠️ Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`)

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay))

            // Exponential backoff with jitter
            delay = Math.min(delay * 2 + Math.random() * 1000, maxDelayMs)
        }
    }

    throw lastError || new Error("Retry failed for unknown reason")
}

/**
 * Specialized retry for Supabase operations
 */
export async function retrySupabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string = "Supabase operation"
): Promise<T> {
    console.log(`🔄 Starting ${operationName}`)

    try {
        const result = await retryWithBackoff(operation, {
            maxRetries: 3,
            initialDelayMs: 500,
            maxDelayMs: 5000,
            timeoutMs: 15000, // 15 second timeout per attempt
        })

        console.log(`✅ ${operationName} completed successfully`)
        return result
    } catch (error: any) {
        console.error(`❌ ${operationName} failed after all retries:`, {
            message: error.message,
            code: error.code,
            status: error.status,
        })
        throw error
    }
}
