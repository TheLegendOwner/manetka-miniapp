import { useTon } from '@/lib/ton';

export default function MainPage() {
  const { wallets, walletInfo, connect, disconnect } = useTon();

  return (
    <div className="p-8">
      {walletInfo ? (
        <div>
          <p>Вы подключены как: <b>{walletInfo.account.address}</b></p>
          <button
            onClick={disconnect}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full shadow"
          >
            Отключить кошелёк
          </button>
        </div>
      ) : (
        <>
          <h2 className="mb-4 text-xl font-semibold">Выберите кошелёк для подключения</h2>
          <ul className="space-y-2">
            {wallets.map((w) => (
              <li key={w.name}>
                <button
                  onClick={() => connect(w)}
                  className="flex items-center px-4 py-2 border rounded-2xl shadow hover:bg-gray-100"
                >
                  <img src={w.imageUrl} alt={w.name} className="w-6 h-6 mr-2" />
                  {w.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
