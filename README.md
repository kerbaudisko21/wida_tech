{
    "info": {
        "_postman_id": "8b87cbe8-aa12-4996-bee1-8e06952b39c9",
        "name": "Express Postman",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Add Invoice",
            "request": {
                "method": "POST",
                "header": [],
                "body": {
                    "mode": "raw",
                    "raw": "{\r\n \"invoice_no\": \"INV001\",\r\n \"date\": \"18/01/2024\",\r\n \"customer_name\": \"gogo\",\r\n \"salesperson_name\": \"bert Smith\",\r\n \"payment_type\": \"CASH\",\r\n \"notes\": \"Not Really Urgent\",\r\n \"products_sold\": [\r\n {\r\n \"item_name\": \"kucing\",\r\n \"quantity\": 1,\r\n \"total_cost_of_goods_sold\": 1500,\r\n \"total_price_sold\": 2000\r\n },\r\n {\r\n \"item_name\": \"Tikus\",\r\n \"quantity\": 1,\r\n \"total_cost_of_goods_sold\": 20,\r\n \"total_price_sold\": 40\r\n }\r\n ]\r\n}",
                    "options": {
                        "raw": {
                            "language": "json"
                        }
                    }
                },
                "url": {
                    "raw": "http://localhost:8800/api/invoice/add",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8800",
                    "path": ["api", "invoice", "add"]
                }
            },
            "response": []
        },
        {
            "name": "Upload Invoice",
            "request": {
                "method": "POST",
                "header": [],
                "body": {
                    "mode": "formdata",
                    "formdata": [
                        {
                            "key": "file",
                            "type": "file",
                            "src": "/C:/Users/wilbe/Downloads/InvoiceImport-2.xlsx"
                        }
                    ]
                },
                "url": {
                    "raw": "http://localhost:8800/api/invoice/upload",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8800",
                    "path": ["api", "invoice", "upload"]
                }
            },
            "response": []
        },
        {
            "name": "Update Invoice",
            "request": {
                "method": "POST",
                "header": [],
                "body": {
                    "mode": "raw",
                    "raw": "{\r\n \"date\": \"18/01/2021\",\r\n \"customer_name\": \"gogoWil\",\r\n \"salesperson_name\": \"bert\",\r\n \"payment_type\": \"CASH\",\r\n \"notes\": \"Not Really\",\r\n \"products_sold\": [\r\n {\r\n \"item_name\": \"kucing\",\r\n \"quantity\": 1,\r\n \"total_cost_of_goods_sold\": 1500,\r\n \"total_price_sold\": 2000\r\n },\r\n {\r\n \"item_name\": \"Tikus\",\r\n \"quantity\": 1,\r\n \"total_cost_of_goods_sold\": 20,\r\n \"total_price_sold\": 40\r\n }\r\n ]\r\n}",
                    "options": {
                        "raw": {
                            "language": "json"
                        }
                    }
                },
                "url": {
                    "raw": "http://localhost:8800/api/invoice/update/{{invoice_no}}",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8800",
                    "path": ["api", "invoice", "update", "{{invoice_no}}"]
                }
            },
            "response": []
        },
        {
            "name": "Delete Invoice",
            "request": {
                "method": "DELETE",
                "header": [],
                "url": {
                    "raw": "http://localhost:8800/api/invoice/delete/inv001",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8800",
                    "path": ["api", "invoice", "delete", "inv001"]
                }
            },
            "response": []
        },
        {
            "name": "Get Detail Invoice",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "http://localhost:8800/api/invoice/detail/{{invoice_no}}",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8800",
                    "path": ["api", "invoice", "detail", "{{invoice_no}}"]
                }
            },
            "response": []
        },
        {
            "name": "Get All Invoice",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "http://localhost:8800/api/invoice/",
                    "protocol": "http",
                    "host": ["localhost"],
                    "port": "8800",
                    "path": ["api", "invoice", ""]
                }
            },
            "response": []
        }
    ]
}
