/**
 * Share text using the native Web Share API if available, 
 * with a fallback to clipboard copy.
 */
export async function shareText(title: string, text: string): Promise<boolean> {
    try {
        if (navigator.share) {
            await navigator.share({ title, text });
            return true;
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            alert("Copied to clipboard! 🔗");
            return true;
        } else {
            // Last resort: hidden textarea
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert("Copied to clipboard! 🔗");
                return true;
            } catch (err) {
                console.error("Manual copy failed", err);
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (e: any) {
        if (e.name !== "AbortError") {
            console.error("Error sharing", e);
        }
        return false;
    }
}
