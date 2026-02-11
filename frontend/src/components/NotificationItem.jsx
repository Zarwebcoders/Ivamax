import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserPlus, Trophy, CheckCircle, Package, Users, UserCheck,
    DollarSign, ArrowDownLeft, MessageCircle, CheckCircle2,
    Megaphone, Settings, Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP = {
    REGISTRATION: UserPlus,
    RANK_ACHIEVED: Trophy,
    PAYMENT_RELEASED: CheckCircle,
    PACKAGE_ACTIVATED: Package,
    NEW_TEAM_MEMBER: Users,
    DIRECT_REFERRAL: UserCheck,
    PAYMENT_GENERATED: DollarSign,
    WITHDRAWAL_REQUEST: ArrowDownLeft,
    WITHDRAWAL_RELEASED: CheckCircle,
    INQUIRY_CREATED: MessageCircle,
    INQUIRY_RESOLVED: CheckCircle2,
    COMPANY_UPDATE: Megaphone,
    PROFILE_UPDATED: Settings
};

const COLOR_MAP = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    golden: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600'
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
    const navigate = useNavigate();
    const Icon = ICON_MAP[notification.type] || MessageCircle;
    const colorClass = COLOR_MAP[notification.color] || COLOR_MAP.blue;

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(notification._id);
    };

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

    return (
        <div
            onClick={handleClick}
            className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50/50' : ''
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={handleDelete}
                            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Unread Indicator */}
                {!notification.isRead && (
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
