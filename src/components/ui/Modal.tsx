import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, subtitle, icon, children, size = 'md' }: ModalProps) {
  const maxWidth = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`relative w-full ${maxWidth[size]} transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all`}
              >
                <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {icon && (
                      <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
                        <Icon name={icon} size={22} />
                      </div>
                    )}
                    <div>
                      {title && (
                        <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 leading-tight">
                          {title}
                        </Dialog.Title>
                      )}
                      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
                <div className="p-6 pt-4">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
