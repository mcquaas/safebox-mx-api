#!/bin/bash

echo "=== Estado del servidor Strapi API ==="
echo ""

echo "1. Estado de PM2:"
pm2 status

echo ""
echo "2. Estado de Nginx:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "3. Verificación de conexión local:"
curl -I http://localhost 2>/dev/null | head -5

echo ""
echo "4. Logs recientes de PM2:"
pm2 logs strapi-api --lines 5

echo ""
echo "5. Puertos en uso:"
sudo netstat -tlnp | grep -E ':(80|443|1337)'

echo ""
echo "6. Estado del certificado SSL:"
sudo certbot certificates 2>/dev/null | grep -E "(Certificate Name|Expiry Date|VALID)" | head -3

echo ""
echo "7. Verificación HTTPS:"
curl -I https://api.mysafebox.org 2>/dev/null | head -3

echo ""
echo "=== Comandos útiles ==="
echo "- Ver logs en tiempo real: pm2 logs strapi-api"
echo "- Reiniciar aplicación: pm2 restart strapi-api"
echo "- Verificar configuración nginx: sudo nginx -t"
echo "- Reiniciar nginx: sudo systemctl restart nginx"
echo "- Estado completo: pm2 monit"
echo "- Renovar certificado: sudo certbot renew"
echo "- Verificar certificados: sudo certbot certificates" 