# 🧶 Crochet E-Commerce Postman Collection & Guide

This directory contains the complete Postman workspace files for testing and interacting with the Artisan Crochet E-Commerce REST API (replacing Swagger).

## Files Included
1. **`crochet-api.postman_collection.json`**: Complete Postman Collection v2.1 with 10 folders.
2. **`crochet-api.postman_environment.json`**: Pre-configured environment variables.

---

## 🚀 Quick Setup in Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select both:
   - `crochet-api.postman_collection.json`
   - `crochet-api.postman_environment.json`
4. In the top right corner of Postman, select the active environment **`Crochet API Local Environment`**.

---

## ⚡ Automated Authentication Workflow

- **Admin Testing**:
  1. Open folder `1. Admin Auth` $\to$ click `Admin Login` $\to$ **Send**.
  2. The test script automatically captures the returned JWT and saves it as `{{admin_token}}`.
  3. All subsequent Admin requests (`Create Category`, `Create Tag`, `Create Product`, `Update Order Status`) automatically use this token.

- **Customer Testing**:
  1. Open folder `2. Customer Auth` $\to$ click `Customer Login` (or `Customer Register` or `Customer Google Sign-In`) $\to$ **Send**.
  2. The test script automatically captures the JWT and saves it as `{{customer_token}}`.
  3. All Cart, Address, Checkout, and Order requests automatically use this token.

---

## 🏷️ Tag Master & Filtering
- In `3. Tags Master`, execute `Get All Tags` or `Get Tag by Slug`.
- In `5. Products`, query products by tags (e.g. `tag=flower,purse`).
