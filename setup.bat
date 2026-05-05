@echo off
echo Installing Resumate project dependencies...
echo No Python virtual environment is required.

echo Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo Installing Frontend Dependencies...
cd Frontend
npm install
cd ..

echo Install complete.
pause
