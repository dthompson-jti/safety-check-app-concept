# Toast Comparison: Playground vs. Production

This table compares the toast definitions used in the **Toast Playground** (`DeveloperModal.tsx`) against the **Actual Toasts** found in the application code.

| Toast Type | Playground Definition | Actual Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Scan Success** | **Msg:** "Check completed"<br>**Icon:** `check_circle`<br>**Var:** `success` | **Msg:** "Check completed"<br>**Icon:** `check_circle`<br>**Var:** `success` | ✅ **Match** |
| **Supplemental** | **Msg:** "Supplemental check saved"<br>**Icon:** `task_alt`<br>**Var:** `success` | **Msg:** "Supplemental check for ${room} saved."<br>**Icon:** `task_alt`<br>**Var:** `success` | ⚠️ **Near Match**<br>*(Actual includes dynamic room name)* |
| **Neutral Info** | **Msg:** "No incomplete checks"<br>**Icon:** `info`<br>**Var:** `neutral` | **Msg:** "No incomplete checks found in current list."<br>**Icon:** `info`<br>**Var:** `neutral` | ⚠️ **Near Match**<br>*(Actual is more verbose)* |
| **Missed Check** | **Msg:** "Check for Room 101 missed"<br>**Icon:** `history`<br>**Var:** `warning` | **Msg:** "${count} checks missed" (accumulated)<br>**Icon:** `history`<br>**Var:** `warning` | ⚠️ **simulated**<br>*(Playground simulates single, Actual accumulates)* |
| **NFC Error** | **Msg:** "Tag not read. Hold phone steady against the tag."<br>**Icon:** `wifi_tethering_error`<br>**Var:** `alert` | **Msg:** "Tag not read. Hold phone steady against the tag."<br>**Icon:** `wifi_tethering_error`<br>**Var:** `alert` | ✅ **Match**<br>*(Implemented in AppFooter)* |
| **Camera Error** | **Msg:** "Camera not responding..."<br>**Icon:** `no_photography`<br>**Var:** `alert` | *Handled via Viewfinder Overlay* | ℹ️ **Overlay**<br>*(Camera fails show UI overlay, not toast)* |
| **Sync Complete** | **Msg:** "Data synced"<br>**Icon:** `cloud_done`<br>**Var:** `success` | *Not found in recent grep search* | ❓ **Missing?**|
| **Reset Data** | *N/A (Not in Playground)* | **Msg:** "Application data reset to defaults."<br>**Icon:** `delete`<br>**Var:** `neutral` | ℹ️ **Dev Tool Only** |

## Recommendations
1.  **Sync Complete**: Verify if the "Data synced" toast is actually implemented in the sync logic (not found in search).
2.  **Neutral Info**: Consolidate wording. "No incomplete checks" is cleaner than "No incomplete checks found in current list."
3.  **Supplemental**: The playground version is acceptable as a generic representation.
